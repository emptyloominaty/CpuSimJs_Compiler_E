let imports = {
    /*--------------------------------------------------READ KEY--------------------------------------------------*/
    keyboard:{name:"keyboard",
        vars:"var keyBufferAddress_import $FF00 \n" +
            "var8 writePointer_import 0  \n" +
            "var8 readPointer_import 0 \n" +
            "avar8 keyBufferFirst_import 0 $FF00 \n" +
            "var8 keyboardBufferValueReturn_import \n",
        startCode:"STAIP 1 interruptKeyboard_import\n",
        endCode:"<readKeyboardBuffer_import> \n" +
            "PSH r0 \n" +
            "PSH r1 \n" +
            "PSH r2 \n" +

            "LD8 r0 writePointer_import  \n" +
            "LD8 r1 readPointer_import  \n" +
            "JE r0 r1 returnFromKeyboardBufferRead_import \n" +

            "LD r2 keyBufferAddress_import  \n" +
            "AD2 r2 r1 \n" +
            "LDR8 r0 r2 \n" +
            "INC r1 \n" +
            "ST8 r1 readPointer \n" +
            "ST8 r0 keyboardBufferValueReturn_import \n" +

            "<returnFromKeyboardBufferRead_import> \n" +
            "PSH r2 \n" +
            "PSH r1 \n" +
            "PSH r0 \n" +
            "RFS \n" +

            "<interruptKeyboard_import>\n" +
            "PSH r0\n" +
            "PSH r1\n" +
            "PSH r2\n" +
            "PSH r3\n" +
            "LDX8 r3 $0A0000 \n" +
            "LD8 r0 writePointer_import \n" +
            "LD8 r1 readPointer_import \n" +
            "LD r2 keyBufferAddress_import \n" +
            "AD2 r2 r0 \n" +
            "STR8 r3 r2  \n" +
            "INC r0 \n" +
            "ST8 r0 writePointer_import \n" +
            "JMP returnFromInterruptKeyboard_import \n" +
            "<returnFromInterruptKeyboard_import> \n" +
            "POP r3 \n" +
            "POP r2 \n" +
            "POP r1 \n" +
            "POP r0 \n" +
            "RFI \n"
    },
    /*--------------------------------------------------DRAW CHAR--------------------------------------------------*/
    drawChar:{
        vars:"var8 char_drawChar_import 0\n" +
            "var8 charsRow_drawChar_import 0\n" +
            "var8 charsRowMax_drawChar_import 46 \n" +
            "var frameBufferPointer_drawChar_import 0\n",
        startCode:"LDX r15 $010001 \n",
        endCode:
            "<drawChar_function_import>\n" +
            "PSH r0 \n" +
            "PSH r1 \n" +
            "PSH r2 \n" +
            "PSH r3 \n" +
            "PSH r4 \n" +
            "PSH r5 \n" +
            "PSH r6 \n" +
            "PSH r7 \n" +
            "PSH r8 \n" +
            "PSH r9 \n" +
            "PSH r10 \n" +
            "PSH r11 \n" +
            "PSH r12 \n" +
            "PSH r13 \n" +
            "PSH r14 \n" +
            "PSH r15 \n" +
            "LDI8 r1 9\n" +
            "LD8 r2 char_drawChar_import\n" +
            "JE r1 r2 doEnter_drawChar_import\n" +
            "LDI8 r0 32\n" +
            "JL r2 r0 returnFrom_drawChar_import\n" +
            "LDI8 r14 1  \n" +  //gpu address Hi
            "LD r15 frameBufferPointer_drawChar_import \n" + //gpu address Lo
            "TRR r2 r9\n" + //
            "LDI8 r12 0\n" + //CharRom Lo
            "LDI8 r11 2\n" + //CharRom Hi

            "MULI r9 8\n" +
            "LDI8 r12 0\n" +
            "AD2 r12 r9\n" + //get char Address
            "TRR r12 r10\n" +
            "ADDI r10 8\n" +
            "JSR nextRow_drawChar_import\n" +
            "JMP nextCharLine_import\n" +

            "<nextCharLine_import>\n" +
            "LDRX8 r0 r11\n" +
            "CBT8 r0\n" +
            "JMP drawCharLine_import\n" +

            "<drawCharLine_import>\n" +
            "TRR r4 r13\n" +
            "JSR drawCharPixel_import\n" +
            "TRR r3 r13\n" +
            "JSR drawCharPixel_import\n" +
            "TRR r2 r13\n" +
            "JSR drawCharPixel_import\n" +
            "TRR r1 r13\n" +
            "JSR drawCharPixel_import\n" +
            "TRR r0 r13\n" +
            "JSR drawCharPixel_import\n" +
            "LDX r0 $010005\n" +
            "AD2 r15 r0\n" +
            "SUBI r15 5\n" +
            "INC r12\n" +
            "JE r10 r12 next_drawChar_import\n" +
            "JMP nextCharLine_import\n" +

            "<drawCharPixel_import>\n" +
            "STRX8 r13 r14\n" +
            "INC r15\n" +
            "RFS\n" +

            "<next_drawChar_import>\n" +
            "SUBI r15 2554\n" + //2560 - 6   (2560 = 320 * 8)
            "JMP returnFrom_drawChar_import\n" +

            "<nextRow_drawChar_import>\n" +
            "LD8 r8 charsRow_drawChar_import \n" +
            "LD8 r7 charsRowMax_drawChar_import\n" +
            "INC r8\n" +
            "ST8 r8 charsRow_drawChar_import \n" +
            "JE r8 r7 nextRowAdd_drawChar_import\n" +
            "RFS\n" +

            "<nextRowAdd_drawChar_import>\n" +
            "LDI8 r8 1\n" +
            "ST8 r8 charsRow_drawChar_import\n" +
            "ADDI r15 2565\n" +
            "RFS\n" +

            "<doEnter_drawChar_import>\n" +
            "LD8 r0 charsRow_drawChar_import\n" +
            "LD8 r1 charsRowMax_drawChar_impor\n" +
            "LDI8 r2 6\n" + //char size
            "DEC r1\n" +
            "SUB r1 r0 r4 \n" +
            "MUL r4 r2 r5\n" +
            "ADDI r5 5\n" +
            "AD2 r15 r5\n" +
            "ADDI r15 2561 \n" +
            "LDI8 r0 0 \n" +
            "ST8 r0 charsRow_drawChar_import\n" +

            "<returnFrom_drawChar_import>\n" +
            "ST r15 frameBufferPointer_drawChar_import\n" +
            "POP r15 \n" +
            "POP r14 \n" +
            "POP r13 \n" +
            "POP r12 \n" +
            "POP r11 \n" +
            "POP r10 \n" +
            "POP r9 \n" +
            "POP r8 \n" +
            "POP r7 \n" +
            "POP r6 \n" +
            "POP r5 \n" +
            "POP r4 \n" +
            "POP r3 \n" +
            "POP r2 \n" +
            "POP r1 \n" +
            "POP r0 \n" +
            "RFS \n",

    },
    /*--------------------------------------------------DRAW PIXEL--------------------------------------------------*/
    drawPixel:{
        vars:"",
        startCode:"",
        endCode:"" +
            "<drawPixel_function_import>\n" +
            "PSH r8 \n" +
            "PSH r9 \n" +
            "PSH r10 \n" +
            "PSH r14 \n" +
            "PSH r15 \n" +

            "LDI8 r14 1 \n" +       //gpu hi
            "LDX r15 $010001\n" +   //gpu lo

            "LDX r9 $010005 \n" +   //width
            "LDX r10 $010007\n" +   //height

            "MUL r9 r12 r8 \n" +  //width*y
            "AD2 r15 r8 \n" + //y
            "AD2 r15 r11\n" + //x

            "STRX8 r13 r14\n" +//draw pixel

            "POP r15 \n" +
            "POP r14 \n" +
            "POP r10 \n" +
            "POP r9 \n" +
            "POP r8 \n" +
            "RFS \n"
    },
}
