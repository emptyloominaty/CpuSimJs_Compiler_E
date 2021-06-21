let imports = {keyboard:{name:"keyboard",
        vars:"var keyBufferAddress_system $FF00 \n" +
            "var8 writePointer_system 0  \n" +
            "var8 readPointer_system 0 \n" +
            "avar8 keyBufferFirst_system 0 $FF00 \n" +
            "var8 keyboardBufferValueReturn_system \n",
        startCode:"STAIP 1 interruptKeyboard_system\n",
        endCode:"<readKeyboardBuffer_System> \n" +
            "PSH r0 \n" +
            "PSH r1 \n" +
            "PSH r2 \n" +

            "LD8 r0 writePointer_system  \n" +
            "LD8 r1 readPointer_system  \n" +
            "JE r0 r1 returnFromKeyboardBufferRead_system \n" +

            "LD r2 keyBufferAddress_system  \n" +
            "AD2 r2 r1 \n" +
            "LDR8 r0 r2 \n" +
            "INC r1 \n" +
            "ST8 r1 readPointer \n" +
            "ST8 r0 keyboardBufferValueReturn_system \n" +

            "<returnFromKeyboardBufferRead_system> \n" +
            "PSH r2 \n" +
            "PSH r1 \n" +
            "PSH r0 \n" +
            "RFS \n" +

            "<interruptKeyboard_system>\n" +
            "PSH r0\n" +
            "PSH r1\n" +
            "PSH r2\n" +
            "PSH r3\n" +
            "LDX8 r3 $0A0000 \n" +
            "LD8 r0 writePointer_system \n" +
            "LD8 r1 readPointer_system \n" +
            "LD r2 keyBufferAddress_system \n" +
            "AD2 r2 r0 \n" +
            "STR8 r3 r2  \n" +
            "INC r0 \n" +
            "ST8 r0 writePointer_system \n" +
            "JMP returnFromInterruptKeyboard_system \n" +
            "<returnFromInterruptKeyboard_system> \n" +
            "POP r3 \n" +
            "POP r2 \n" +
            "POP r1 \n" +
            "POP r0 \n" +
            "RFI \n"
    },
}
