import { renderHook, act } from "@testing-library/react";
import { useWakeLock } from "../useWakeLock";

describe("useWakeLock", () => {
  let mockWakeLock: {
    release: jest.Mock;
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
  };
  let mockRequest: jest.Mock;
  let originalNavigator: PropertyDescriptor | undefined;
  let visibilityState: DocumentVisibilityState;
  let visibilityChangeHandler: (() => void) | null = null;

  beforeEach(() => {
    mockWakeLock = {
      release: jest.fn().mockResolvedValue(undefined),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    mockRequest = jest.fn().mockResolvedValue(mockWakeLock);

    originalNavigator = Object.getOwnPropertyDescriptor(global, "navigator");
    Object.defineProperty(global, "navigator", {
      value: {
        wakeLock: {
          request: mockRequest,
        },
      },
      writable: true,
      configurable: true,
    });

    visibilityState = "visible";
    Object.defineProperty(document, "visibilityState", {
      get: () => visibilityState,
      configurable: true,
    });

    jest
      .spyOn(document, "addEventListener")
      .mockImplementation((event, handler) => {
        if (event === "visibilitychange") {
          visibilityChangeHandler = handler as () => void;
        }
      });
    jest.spyOn(document, "removeEventListener").mockImplementation(() => {});
  });

  afterEach(() => {
    if (originalNavigator) {
      Object.defineProperty(global, "navigator", originalNavigator);
    }
    visibilityChangeHandler = null;
    jest.restoreAllMocks();
  });

  it("should request wake lock when enabled is true", async () => {
    renderHook(() => useWakeLock({ enabled: true }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockRequest).toHaveBeenCalledWith("screen");
  });

  it("should not request wake lock when enabled is false", async () => {
    renderHook(() => useWakeLock({ enabled: false }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("should release wake lock when enabled changes to false", async () => {
    const { rerender } = renderHook(({ enabled }) => useWakeLock({ enabled }), {
      initialProps: { enabled: true },
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);

    rerender({ enabled: false });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockWakeLock.release).toHaveBeenCalled();
  });

  it("should re-acquire wake lock when enabled changes to true", async () => {
    const { rerender } = renderHook(({ enabled }) => useWakeLock({ enabled }), {
      initialProps: { enabled: false },
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockRequest).not.toHaveBeenCalled();

    rerender({ enabled: true });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockRequest).toHaveBeenCalledWith("screen");
  });

  it("should re-acquire wake lock on visibility change when enabled", async () => {
    renderHook(() => useWakeLock({ enabled: true }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);

    // Simulate tab becoming hidden then visible
    visibilityState = "hidden";
    visibilityState = "visible";

    await act(async () => {
      visibilityChangeHandler?.();
      await Promise.resolve();
    });

    expect(mockRequest).toHaveBeenCalledTimes(2);
  });

  it("should not re-acquire wake lock on visibility change when disabled", async () => {
    renderHook(() => useWakeLock({ enabled: false }));

    await act(async () => {
      await Promise.resolve();
    });

    // Simulate visibility change
    await act(async () => {
      visibilityChangeHandler?.();
      await Promise.resolve();
    });

    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("should release wake lock on unmount", async () => {
    const { unmount } = renderHook(() => useWakeLock({ enabled: true }));

    await act(async () => {
      await Promise.resolve();
    });

    unmount();

    expect(mockWakeLock.release).toHaveBeenCalled();
    expect(document.removeEventListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function)
    );
  });

  describe("graceful degradation", () => {
    it("should not throw when Wake Lock API is unavailable", async () => {
      Object.defineProperty(global, "navigator", {
        value: {},
        writable: true,
        configurable: true,
      });

      expect(() => {
        renderHook(() => useWakeLock({ enabled: true }));
      }).not.toThrow();
    });

    it("should handle wake lock request failure gracefully", async () => {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockRequest.mockRejectedValueOnce(new Error("Low battery"));

      expect(() => {
        renderHook(() => useWakeLock({ enabled: true }));
      }).not.toThrow();

      await act(async () => {
        await Promise.resolve();
      });

      expect(consoleError).toHaveBeenCalledWith(
        "Wake lock request failed:",
        expect.any(Error)
      );

      consoleError.mockRestore();
    });

    it("should handle wake lock release failure gracefully", async () => {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockWakeLock.release.mockRejectedValueOnce(new Error("Release failed"));

      const { rerender } = renderHook(
        ({ enabled }) => useWakeLock({ enabled }),
        { initialProps: { enabled: true } }
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(() => {
        rerender({ enabled: false });
      }).not.toThrow();

      await act(async () => {
        await Promise.resolve();
      });

      expect(consoleError).toHaveBeenCalledWith(
        "Wake lock release failed:",
        expect.any(Error)
      );

      consoleError.mockRestore();
    });
  });
});
