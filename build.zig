const std = @import("std");

pub fn build(b: *std.Build) void {
    const zf = b.dependency("zf", .{
        .with_tui = false,
    });

    const exe = b.addExecutable(.{
        .name = "zf",
        .root_source_file = b.path("playground.zig"),
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

    const copy_wasm = b.addInstallFile(exe.getEmittedBin(), "web/zf.wasm");
    const copy_html = b.addInstallFile(b.path("index.html"), "web/index.html");
    const copy_css = b.addInstallFile(b.path("style.css"), "web/style.css");
    const copy_js = b.addInstallFile(b.path("playground.js"), "web/playground.js");
    b.getInstallStep().dependOn(&copy_wasm.step);
    b.getInstallStep().dependOn(&copy_html.step);
    b.getInstallStep().dependOn(&copy_css.step);
    b.getInstallStep().dependOn(&copy_js.step);
}
