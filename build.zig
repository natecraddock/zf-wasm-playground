const std = @import("std");

pub fn build(b: *std.Build) void {
    const zf = b.dependency("zf", .{});

    const exe = b.addExecutable(.{
        .name = "zf",
        .root_source_file = .{ .path = "playground.zig" },
        .target = b.resolveTargetQuery(.{
            .cpu_arch = .wasm32,
            .os_tag = .freestanding,
        }),
        .optimize = .ReleaseSmall,
    });

    exe.root_module.addImport("zf", zf.module("zf"));

    exe.entry = .disabled;
    exe.rdynamic = true;
    exe.import_memory = true;
    exe.stack_size = std.wasm.page_size;

    exe.initial_memory = std.wasm.page_size * 4;
    exe.max_memory = std.wasm.page_size * 4;

    b.installArtifact(exe);
}
