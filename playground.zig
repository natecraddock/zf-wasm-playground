const std = @import("std");

const zf = @import("zf");

export fn bufPtr() [*]u8 {
    return @ptrCast(&buf);
}

/// wasm memory
var buf: [std.wasm.page_size]u8 = undefined;

/// buffer to hold the string
var str_buf: []u8 = buf[0..512];

/// buffer to hold the filename
var filename_buf: []u8 = buf[512..1024];

/// buffer to hold the token
var token_buf: []u8 = buf[1024 .. 1024 + 64];

export fn rankToken(str_len: u32, filename_len: u32, token_len: u32, case_sensitive: u8, strict_path: u8) f64 {
    const str = str_buf[0..str_len];
    const filename = if (filename_len != 0) filename_buf[0..filename_len] else null;
    const token = token_buf[0..token_len];

    return zf.rankToken(str, filename, token, case_sensitive != 0, strict_path != 0) orelse -1.0;
}
