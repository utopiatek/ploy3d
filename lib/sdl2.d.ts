/// <reference path="lib.deno.ns.d.ts" />
/**
 * An enum that contains structures for the different event types.
 */
export declare enum EventType {
    First = 0,
    Quit = 256,
    AppTerminating = 257,
    AppLowMemory = 258,
    AppWillEnterBackground = 259,
    AppDidEnterBackground = 260,
    AppWillEnterForeground = 261,
    AppDidEnterForeground = 262,
    WindowEvent = 512,
    KeyDown = 768,
    KeyUp = 769,
    TextEditing = 770,
    TextInput = 771,
    MouseMotion = 1024,
    MouseButtonDown = 1025,
    MouseButtonUp = 1026,
    MouseWheel = 1027,
    AudioDeviceAdded = 4352,
    AudioDeviceRemoved = 4353,
    User = 32768,
    Last = 65535,
    Draw = 65536
}
declare const _raw: unique symbol;
/**
 * SDL2 canvas.
 */
export declare class Canvas {
    private window;
    private target;
    constructor(window: Deno.PointerValue, target: Deno.PointerValue);
    /**
     * Set the color used for drawing operations (Rect, Line and Clear).
     * @param r the red value used to draw on the rendering target
     * @param g the green value used to draw on the rendering target
     * @param b the blue value used to draw on the rendering target
     * @param a the alpha value used to draw on the rendering target; usually SDL_ALPHA_OPAQUE (255).
     */
    setDrawColor(r: number, g: number, b: number, a: number): void;
    /**
     * Clear the current rendering target with the drawing color.
     */
    clear(): void;
    /**
     * Update the screen with any rendering performed since the previous call.
     */
    present(): void;
    /**
     * Draw a point on the current rendering target.
     * @param x the x coordinate of the point
     * @param y the y coordinate of the point
     */
    drawPoint(x: number, y: number): void;
    /**
     * Draw multiple points on the current rendering target.
     * @param points an array of Points (x, y) structures that represent the points to draw
     */
    drawPoints(points: [number, number][]): void;
    /**
     * Draw a line on the current rendering target.
     * @param x1 the x coordinate of the start point
     * @param y1 the y coordinate of the start point
     * @param x2 the x coordinate of the end point
     * @param y2 the y coordinate of the end point
     */
    drawLine(x1: number, y1: number, x2: number, y2: number): void;
    /**
     * Draw a series of connected lines on the current rendering target.
     * @param points an array of Points (x, y) structures representing points along the lines
     */
    drawLines(points: [number, number][]): void;
    /**
     * Draw a rectangle on the current rendering target.
     * @param x the x coordinate of the rectangle
     * @param y the y coordinate of the rectangle
     * @param w the width of the rectangle
     * @param h the height of the rectangle
     */
    drawRect(x: number, y: number, w: number, h: number): void;
    /**
     * Draw some number of rectangles on the current rendering target.
     * @param rects an array of Rect (x, y, w, h) structures representing the rectangles to draw
     */
    drawRects(rects: [number, number, number, number][]): void;
    /**
     * Fill a rectangle on the current rendering target with the drawing color.
     * @param x the x coordinate of the rectangle
     * @param y the y coordinate of the rectangle
     * @param w the width of the rectangle
     * @param h the height of the rectangle
     */
    fillRect(x: number, y: number, w: number, h: number): void;
    /**
     * Fill some number of rectangles on the current rendering target with the drawing color.
     * @param rects an array of Rect (x, y, w, h) structures representing the rectangles to fill
     */
    fillRects(rects: [number, number, number, number][]): void;
    /**
     * Copy a portion of the texture to the current rendering target.
     * @param texture the source texture
     * @param source the source rectangle, or null to copy the entire texture
     * @param dest the destination rectangle, or null for the entire rendering target; the texture will be stretched to fill the given rectangle
     */
    copy(texture: Texture, source?: Rect, dest?: Rect): void;
    /**
     * TextureCreator is a helper class for creating textures.
     * @returns a TextureCreator object for use with creating textures
     */
    textureCreator(): TextureCreator;
    /**
     * Create a font from a file, using a specified point size.
     * @param path the path to the font file
     * @param size point size to use for the newly-opened font
     * @returns a Font object for use with rendering text
     */
    loadFont(path: string, size: number): Font;
}
/**
 * Font is a helper class for rendering text.
 */
export declare class Font {
    [_raw]: Deno.PointerValue;
    constructor(raw: Deno.PointerValue);
    /**
     * Render a solid color version of the text.
     * @param text text to render, in Latin1 encoding.
     * @param color the foreground color of the text
     * @returns a Texture object
     */
    renderSolid(text: string, color: Color): Texture;
    /**
     * Render text at high quality to a new ARGB surface.
     * @param text text to render, in Latin1 encoding.
     * @param color the foreground color of the text
     * @returns a Texture object
     */
    renderBlended(text: string, color: Color): Texture;
}
/**
 * Color is a helper class for representing colors.
 */
export declare class Color {
    [_raw]: Deno.PointerValue;
    constructor(r: number, g: number, b: number, a?: number);
}
/**
 * A structure that contains pixel format information.
 * @see https://wiki.libsdl.org/SDL2/SDL_PixelFormat
 */
export declare enum PixelFormat {
    Unknown = 0,
    Index1LSB = 286261504,
    Index1MSB = 287310080,
    Index4LSB = 303039488,
    Index4MSB = 304088064,
    Index8 = 318769153,
    RGB332 = 336660481,
    XRGB4444 = 353504258,
    XBGR4444 = 357698562,
    XRGB1555 = 353570562,
    XBGR1555 = 357764866,
    ARGB4444 = 355602434,
    RGBA4444 = 356651010,
    ABGR4444 = 359796738,
    BGRA4444 = 360845314,
    ARGB1555 = 355667970,
    RGBA5551 = 356782082,
    ABGR1555 = 359862274,
    BGRA5551 = 360976386,
    RGB565 = 353701890,
    BGR565 = 357896194,
    RGB24 = 386930691,
    BGR24 = 390076419,
    XRGB8888 = 370546692,
    RGBX8888 = 371595268,
    XBGR8888 = 374740996,
    BGRX8888 = 375789572,
    ARGB8888 = 372645892,
    RGBA8888 = 373694468,
    ABGR8888 = 376840196,
    BGRA8888 = 377888772,
    ARGB2101010 = 372711428,
    YV12 = 842094169,
    IYUV = 1448433993,
    YUY2 = 844715353,
    UYVY = 1498831189,
    YVYU = 1431918169
}
/**
 * An enumeration of texture access patterns.
 * @see https://wiki.libsdl.org/SDL2/SDL_TextureAccess
 */
export declare enum TextureAccess {
    Static = 0,
    Streaming = 1,
    Target = 2
}
/**
 * A class used to create textures.
 */
export declare class TextureCreator {
    private raw;
    constructor(raw: Deno.PointerValue);
    /**
     * Create a texture for a rendering context.
     * @param format the format of the texture
     * @param access one of the enumerated values in TextureAccess or a number
     * @param w the width of the texture in pixels
     * @param h the height of the texture in pixels
     * @returns a Texture object
     *
     * @example
     * ```ts
     * const creator = canvas.textureCreator();
     * const texture = creator.createTexture(
     *  PixelFormat.RGBA8888,
     *  TextureAccess.Static,
     *  640,
     *  480,
     * );
     * ```
     */
    createTexture(format: number, access: number, w: number, h: number): Texture;
    /**
     * Create a texture from a surface.
     * @param surface the surface used to create the texture
     * @returns a Texture object
     */
    createTextureFromSurface(surface: Surface): Texture;
}
/**
 * An interface that contains information about a texture.
 */
export interface TextureQuery {
    format: number;
    access: TextureAccess;
    w: number;
    h: number;
}
/**
 * A structure that contains an efficient, driver-specific representation of pixel data.
 * @see https://wiki.libsdl.org/SDL2/SDL_Texture
 */
export declare class Texture {
    private raw;
    [_raw]: Deno.PointerValue;
    constructor(raw: Deno.PointerValue);
    /**
     * Query the attributes of a texture.
     * @returns a TextureQuery
     */
    query(): TextureQuery;
    /**
     * Set an additional color value multiplied into render copy operations.
     * @param r the red color value
     * @param g the green color value
     * @param b the blue color value
     */
    setColorMod(r: number, g: number, b: number): void;
    /**
     * Set an additional alpha value multiplied into render copy operations.
     * @param a the source alpha value multiplied into copy operations
     */
    setAlphaMod(a: number): void;
    /**
     * Update the given texture rectangle with new pixel data.
     * @param pixels the raw pixel data in the format of the texture
     * @param pitch the number of bytes in a row of pixel data, including padding between lines
     * @param rect an Rect representing the area to update, or null to update the entire texture
     */
    update(pixels: Uint8Array, pitch: number, rect?: Rect): void;
}
/**
 * A structure that contains the definition of a rectangle, with the origin at the upper left.
 * @see https://wiki.libsdl.org/SDL2/SDL_Rect
 */
export declare class Rect {
    [_raw]: Uint32Array;
    constructor(x: number, y: number, w: number, h: number);
    /**
     * The x coordinate of the rectangle.
     */
    get x(): number;
    /**
     * The y coordinate of the rectangle.
     */
    get y(): number;
    /**
     * The width of the rectangle.
     */
    get width(): number;
    /**
     * The height of the rectangle.
     */
    get height(): number;
}
/**
 * A structure that contains a collection of pixels used in software blitting.
 */
export declare class Surface {
    [_raw]: Deno.PointerValue;
    constructor(raw: Deno.PointerValue);
    /**
     * Create a surface from a file.
     * @param path the path to the image file
     * @returns a Surface
     */
    static fromFile(path: string): Surface;
    /**
     * @param path the path to the bmp (bitmap) file
     * @returns a Surface
     */
    static loadBmp(path: string): Surface;
}
export declare function getKeyName(key: number): string;
export declare function startTextInput(): void;
export declare function stopTextInput(): void;
/**
 * A window.
 */
export declare class Window {
    private raw;
    private metalView;
    constructor(raw: Deno.PointerValue, metalView: Deno.PointerValue | null);
    /**
     * Create a 2D rendering context for a window.
     * @returns a valid rendering context (Canvas)
     */
    canvas(): Canvas;
    raise(): void;
    /**
     * Return a Deno.UnsafeWindowSurface that can be used
     * with WebGPU.
     */
    windowSurface(): Deno.UnsafeWindowSurface;
    /**
     * Events from the window.
     */
    events(wait?: boolean): AsyncGenerator<any>;
    [Symbol.dispose](): void;
}
/**
 * A window builder to create a window.
 * @example
 * ```ts
 * const window = new WindowBuilder("Hello World", 800, 600);
 * ```
 */
export declare class WindowBuilder {
    private title;
    private width;
    private height;
    private flags;
    constructor(title: string, width: number, height: number);
    /**
     * Build a window.
     * @returns a window
     */
    build(): Window;
    /**
     * Set the window to be fullscreen.
     */
    fullscreen(): WindowBuilder;
    /**
     * Window usable with an OpenGL context
     */
    opengl(): WindowBuilder;
    /** window is not visible */
    hidden(): WindowBuilder;
    /**
     * Set the window to be borderless.
     */
    borderless(): WindowBuilder;
    /**
     * Set the window to be resizable.
     */
    resizable(): WindowBuilder;
    /** window is minimized */
    minimized(): WindowBuilder;
    /** window is maximized */
    maximized(): WindowBuilder;
    /** window has grabbed mouse input */
    mouseGrabbed(): WindowBuilder;
    /** window has input focus */
    inputFocus(): WindowBuilder;
    /** window has mouse focus */
    mouseFocus(): WindowBuilder;
    /**
     * Set the window to be a foreign window.
     */
    foreign(): WindowBuilder;
    /**
     * Window should be created in high-DPI mode.
     */
    highPixelDensity(): WindowBuilder;
    /** window has mouse captured (unrelated to MOUSE_GRABBED) */
    mouseCapture(): WindowBuilder;
    /**
     * Set the window to be always on top.
     */
    alwaysOnTop(): WindowBuilder;
    /** window should not be added to the taskbar */
    skipTaskbar(): WindowBuilder;
    /** window should be treated as a utility window */
    utility(): WindowBuilder;
    /** window should be treated as a tooltip */
    tooltip(): WindowBuilder;
    /** window should be treated as a popup menu */
    popupMenu(): WindowBuilder;
    /** window has grabbed keyboard input */
    keyboardGrabbed(): WindowBuilder;
    /** window usable for Vulkan surface */
    vulkan(): WindowBuilder;
    /** window usable for Metal view */
    metal(): WindowBuilder;
    /** window with transparent buffer */
    transparent(): WindowBuilder;
}
/**
 * A video subsystem.
 */
export declare class VideoSubsystem {
    /**
     * Get the name of the currently initialized video driver.
     */
    currentVideoDriver(): string;
}
export {};
