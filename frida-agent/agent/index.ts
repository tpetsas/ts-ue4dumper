import Java from "frida-java-bridge";
import { dumpActor, dumpSDK, dumpActorName } from "./dump";
import { GNames_offset, GWorld_offset, GUObjectArray_offset } from "./offset";

var GWorld: NativePointer = ptr(0);
var GNames: NativePointer = ptr(0);
var GUObjectArray: NativePointer = ptr(0);
var ue4: NativePointer | null = ptr(0);

function init() {
    try {
        ue4 = Process.getModuleByName("libUE4.so")!.base;
        if (ue4 != null) {
            GWorld = ue4.add(GWorld_offset).readPointer()
            GNames = ue4.add(GNames_offset)
            GUObjectArray = ue4.add(GUObjectArray_offset)
        }
    } catch (e: unknown) {
        console.warn(
            `[!] Could not find module libUE4.so, exc: ${
                (e as Error)?.stack?.toString() as string
            }`
        );
    }
}

function DumpSDK() {
    if (!Java.available)
        throw new Error(`Java is unavailable, exiting...`);
    Java.perform(() => {
        init();
        dumpSDK(GNames, GUObjectArray);
    });
}


function DumpActor() {
    if (!Java.available)
        throw new Error(`Java is unavailable, exiting...`);
    Java.perform(() => {
        init();
        dumpActor(GNames, GUObjectArray);
    });
}

function DumpActorName() {
    if (!Java.available)
        throw new Error(`Java is unavailable, exiting...`);
    Java.perform(() => {
        init();
        dumpActorName(GWorld, GNames, false);
    });
}

rpc.exports = {
    DumpSDK: DumpSDK,
    DumpActor: DumpActor,
    DumpActorName: DumpActorName,
}

