import Java from "frida-java-bridge";
import { dumpActor, dumpSDK, dumpActorName } from "./dump";
import { GNames_offset, GWorld_offset, GUObjectArray_offset } from "./offset";

var GWorld: NativePointer = ptr(0);
var GNames: NativePointer = ptr(0);
var GUObjectArray: NativePointer = ptr(0);


function init() {
    var module;
    try {
        module = Process.getModuleByName("libUE4.so");
        console.log(
            `* libUE4.so found, base: ${module.base}`
        )
    } catch (e: unknown) {
        console.warn(
            `[!] Could not find module libUE4.so, exc: ${
                (e as Error)?.stack?.toString() as string
            }`
        );
        return false;
    }
    var GWorldAddr = module.base.add(GWorld_offset)
    GNames = module.base.add(GNames_offset)
    GUObjectArray = module.base.add(GUObjectArray_offset)
    console.log(`
        GWorld addr: ${GWorldAddr}
        GNames addr: ${GNames}
        GUObjectArray addr: ${GUObjectArray}
    `)
    try {
        GWorld = GWorldAddr.readPointer()
    } catch (e: unknown) {
        console.warn(
            `[!] Could not read GWorld object - offset might be off, exc: ${
                (e as Error)?.stack?.toString() as string
            }`
        );
        return false;
    }
    return true;
}

/*
import * as OFFSET from "./offset.js";
function getObjectCount(GUObjectArray: NativePointer) {
    var GUObjectElementCount;
    try {
        var GUObjectElementCountAddress = GUObjectArray.add(OFFSET.GAME_FUObjectArray_TUObjectArray_OFFSET).add(OFFSET.GAME_TUObjectArray_NumElements_OFFSET);

        GUObjectElementCount = GUObjectElementCountAddress.readU32();
    } catch (e: unknown) {
        console.warn(
            `[!] Could not read GUObject Element Count Address, exc: ${
                (e as Error)?.stack?.toString() as string
            }`
        );
        return null;
    }
    console.log(`\x1b[32m[+] GUObjectElementCount: ${GUObjectElementCount}\x1b[0m`)
    return GUObjectElementCount;
}
*/

function DumpSDK() {
    if (!Java.available)
        throw new Error(`Java is unavailable, exiting...`);
    if (!init())
        throw new Error(`Init() failed!`);
    Java.perform(function() {
        //var names: string[] = []
        //console.log(`GUObjectArray: ${GUObjectArray}`);
        //var ObjectCount = getObjectCount(GUObjectArray);
        dumpSDK(GNames, GUObjectArray);
    })
}


function DumpActor() {
    if (!Java.available)
        throw new Error(`Java is unavailable, exiting...`);
    if (!init())
        throw new Error(`Init() failed!`);
    Java.perform(() => {
        dumpActor(GNames, GUObjectArray);
    });
}

function DumpActorName() {
    if (!Java.available)
        throw new Error(`Java is unavailable, exiting...`);
    if (!init())
        throw new Error(`Init() failed!`);
    Java.perform(() => {
        dumpActorName(GWorld, GNames, false);
    });
}

rpc.exports = {
    DumpSDK: DumpSDK,
    DumpActor: DumpActor,
    DumpActorName: DumpActorName,
}

