# Browser testing

- Run automated browser checks headlessly, in the background. Never open a test window on the user's active workspace or take focus with `bringToFront()`.
- If a check specifically needs a headed browser, isolate it on a disposable headless Hyprland output/workspace; never move or focus the user's windows.
- A visible live-preview browser is allowed only when the user explicitly requests it. Keep that preview separate from automated tests.
- Chromium must use the NVIDIA RTX 3060. For headless tests set the PRIME/NVIDIA environment variables and `--use-gl=angle --use-angle=gl-egl --ignore-gpu-blocklist --enable-gpu-rasterization`; verify the WebGL renderer.
- Keep checks focused on the change. For content/layout tests, use reduced motion and navigate directly to the target slide instead of replaying the opening animation.
