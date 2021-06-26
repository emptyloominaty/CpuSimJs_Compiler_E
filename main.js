let el_output = document.getElementById("output")
let el_input = document.getElementById("input")
let el_time = document.getElementById("time")

//--------------CONFIG--------------
let cpuRegisters = 16

//----------------------------------
//TODO: fix while()

let registers = new Array(16).fill(0)
let registerPointer = 0
let vars = []
let arrays = []
let strings = []
let addresses = []
let functions = []
let ifFunctions = []
let whileFunctions = []
let importsArray = []

let allVars = {} //name:size

let outputCode = ""
let codeWithoutVars = ""

let reset = function() {
    registers = new Array(16).fill(0)
    registerPointer = 0
    vars = []
    arrays = []
    strings = []
    addresses = []
    functions = []
    ifFunctions = []
    whileFunctions = []
    importsArray = []

    allVars = {} //name:size

    outputCode = ""
    codeWithoutVars = ""

}

//-------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------MAIN
//-------------------------------------------------------------------------------------------------------------------
let compile = function() {
    let startTime = performance.now()
    let input = el_input.value
    //TODO:FIX------------------------------------------------??????????? xD
    input = input.replace('\t','')
    input = input.replace('\t\t','')
    input = input.replace('\t\t\t','')
    input = input.replace('\t\t\t\t','')
    input = input.replace('\t\t\t\t\t','')
    input = input.replace('\t\t\t\t\t\t','')
    //--------------------------------------------------------
    reset()
    init(input)
    getFunctionsCode(input)
    compileVars()
    compileCode()

    test()
    el_output.innerText = outputCode
    el_time.innerText = "Compiled in: "+Math.round((performance.now()-startTime)*100)/100+"ms"

}

//-------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------INIT
//-------------------------------------------------------------------------------------------------------------------
function init(code) {
    code = code.split("\n")
    console.log(code)
    let nOfFunctions = 0
    for(let i = 0; i<code.length; i++) {
        let line =  code[i]
        let line2 = code[i].split(" ")
        line2 = line2.filter(e => e)
     /*  console.log(line2)*/
        let name = line2[1]

        let pushLine = function(line) {
            codeWithoutVars+=line+"\n"
        }
        //-----------------------------------------------------------------------VARS
        if (line2[0]==="var" || line2[0]==="var8" || line2[0]==="var32") {
            let size = 2
            if (line2[0]==="var8") { size = 1 }
            if (line2[0]==="var32") { size = 4 }
            let value = line2[3]
            vars.push({size:size ,val:value ,name:name })
        } else
        //-----------------------------------------------------------------------ARRAYS
        if (line2[0]==="array" || line2[0]==="array8") {
            let values = line2[3].split(",")
            let size =  values.length
            let type = 2
            if (line2[0]==="array8") { type = 1 }
            arrays.push({size:size, vals:values, name:name, type: type})
        } else
        //-----------------------------------------------------------------------STRINGS
        if (line2[0]==="string") {
            let str = line2[3]
            let n = []
            for (let i=0; i<str.length; i++) {
                n.push(str.charCodeAt(i))
            }
            strings.push({size:str.length, values:n, name:name})
        } else
        //-----------------------------------------------------------------------ADDRESSES
        if (line2[0]==="addr" || line2[0]==="addr8" || line2[0]==="addr32") {
            let size = 2
            if (line2[0]==="addr8") { size = 1 }
            if (line2[0]==="addr32") { size = 4 }
            addresses.push({size: size, name:name, address: line2[3]})
        } else
        //-----------------------------------------------------------------------FUNCTIONS
        if (line2[0]==="function") {
            functions.push({name:name,code:"", pos:nOfFunctions})
            nOfFunctions++
            pushLine(line)
        } else
        //-----------------------------------------------------------------------IF
        if (line2[0]==="if") {
            ifFunctions.push({name:"if"+ifFunctions.length,code:"",condition:line2[1], pos:nOfFunctions})
            nOfFunctions++
            pushLine(line)
        } else
        //-----------------------------------------------------------------------WHILE
        if (line2[0]==="while") {
            whileFunctions.push({name:"while"+whileFunctions.length,code:"",condition:line2[1], pos:nOfFunctions})
            nOfFunctions++
            pushLine(line)
        } else if (line2[0]==="#import") {
            importsArray.push(line2[1])
        } else {
            pushLine(line)
        }
    }
}
//-------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------FUNCTIONS
//-------------------------------------------------------------------------------------------------------------------
function getFunctionsCode(code) {
    let codeArray = codeWithoutVars.split('') //code.split('')
    let codeFunctions = []
    let depth = 0
    let depthArray = new Array(256).fill(0)


    for (let i=0; i<codeArray.length; i++) {
        if (codeArray[i]==="{") {
            codeFunctions.push({startPos:i,endPos:0})
            depth++
        }
        if (codeArray[i]==="}") {
            depth--
            let realDepth = getReal(depth,depthArray)
            codeFunctions[depth+realDepth].endPos = i
            depthArray[depth]++
        }
    }

    for (let i=0; i<codeFunctions.length; i++) {
        codeFunctions[i].code = codeWithoutVars.slice(codeFunctions[i].startPos+1,codeFunctions[i].endPos) //code.
    }

    for (let i=0; i<functions.length; i++) {
        functions[i].code = codeFunctions[functions[i].pos].code
    }

    for (let i=0; i<ifFunctions.length; i++) {
        ifFunctions[i].code = codeFunctions[ifFunctions[i].pos].code
    }

    for (let i=0; i<whileFunctions.length; i++) {
        whileFunctions[i].code = codeFunctions[whileFunctions[i].pos].code
    }
    console.log("codeFunctions")
    console.log(codeFunctions)
    console.log("--------------")
    console.log(depthArray)
}

//-------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------VARS
//-------------------------------------------------------------------------------------------------------------------
function compileVars() {
    //VARS
    for (let i=0; i<vars.length; i++) {
        let varName = "var"
        if (vars[i].size===1) {
            varName = "var8"
        } else if (vars[i].size===4) {
            varName = "var32"
        }
        outputCode+= varName+" "+vars[i].name+" "+vars[i].val+" \n"
        allVars[vars[i].name] = vars[i].size
    }

    //ARRAYS
    for (let i=0; i<arrays.length; i++) {
        let varName = "var"
        if (arrays[i].type===1) { varName = "var8" }
        outputCode+= "var "+arrays[i].name+".size "+arrays[i].vals.length+" \n"
        allVars[arrays[i].name+".size"] = arrays[i].type
        for (let j=0; j<arrays[i].size; j++) {
            outputCode+= varName+" "+arrays[i].name+"["+j+"] "+arrays[i].vals[j]+" \n"
            allVars[arrays[i].name+"["+j+"]"] = arrays[i].type
        }
    }

    //STRINGS
    for (let i=0; i<strings.length; i++) {
        outputCode+= "var8 "+strings[i].name+"SSize "+strings[i].values.length+" \n"
        allVars[strings[i].name+"SSize"] = 1
        for (let j=0; j<strings[i].size; j++) {
            outputCode+= "var8 "+strings[i].name+"S"+j+" "+strings[i].values[j]+" \n"
            allVars[strings[i].name+"S"+j] = 1
        }
    }
    //ADDRESSES
    for (let i=0; i<addresses.length; i++) {
            let varName = "avar"
            if (addresses[i].size===1) {
                varName = "avar8"
            } else if (addresses[i].size===4) {
                varName = "avar32"
            }
        outputCode+= varName+" "+addresses[i].name+" 0 "+addresses[i].address+" \n"
        allVars[addresses[i].name] = addresses[i].size
    }
    //IMPORTS VARS
    if (importsArray.length>0) {
        for (let i = 0; i<importsArray.length; i++) {
            outputCode+=imports[importsArray[i]].vars
        }
    }

}

//-------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------COMPILE
//-------------------------------------------------------------------------------------------------------------------
function compileCode() {
    //
    if (importsArray.length>0) {
        for (let i = 0; i<importsArray.length; i++) {
            outputCode+=imports[importsArray[i]].startCode
        }
    }
    //
    outputCode+="\nJSR main \n"
    outputCode+="STOP \n"
    //
    if (importsArray.length>0) {
        for (let i = 0; i<importsArray.length; i++) {
            outputCode+=imports[importsArray[i]].endCode
        }
    }

    //functions
    for (let i = 0; i<functions.length; i++) {
        outputCode+="\n<"+functions[i].name+"> \n"

        let c = decode(functions[i].code,"function")
        outputCode += c
    }

    //if functions
    for (let i = 0; i<ifFunctions.length; i++) {
        outputCode+="\n<"+ifFunctions[i].name+"> \n"

        let c = decode(ifFunctions[i].code,"if")
        outputCode += c

    }

    //while functions
    for (let i = 0; i<whileFunctions.length; i++) {
        outputCode+="\n<"+whileFunctions[i].name+"> \n"

        let c = decode(whileFunctions[i].code,"while")
        outputCode += c
    }
}

let ifF = 0
let whileF = 0
let whileConditionEnd = []
//-------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------COMPILE 2
//-------------------------------------------------------------------------------------------------------------------
function decode(code,type) {
    let c = code.replace(/ *\{[^}]*\} */g, "")
    c = c.replace("}","")
    let lines = c.split("\n")
    let realCode = ""

    /*console.log("CODEE")
    console.log(code)
    console.log(c)*/
    //-----------------------------

    for (let i=0 ; i<lines.length; i++) {
        let line = lines[i]
        let tokens = line.split(" ")
        tokens = tokens.filter(e => e)
        let loadVars = [undefined,undefined,undefined,undefined]
        let operator = ""
        let storeVar = 0
        let op = ""
        let func = 0
        let condition = 0
        let jumpCondition = 0
        let regs = ["r0","r1","r2","r3","r4"]


        if (tokens[2]==="readKey()"){ // var8 = readKey()
            op = "readKey"
            loadVars = []
            storeVar = tokens[0]
        } else if (tokens[0]==="drawChar()") { // drawChar() = var8
            op = "drawChar"
            loadVars = []
        } else if (tokens[1]==="=" && tokens.length===3)  { // var = 5  ; var = a
            op = "=="
            loadVars = [tokens[2]]
            storeVar = tokens[0]
        } else if (tokens[1]==="=") { //var = 5 + 2 ; var = a + b
            op = "="
            loadVars = [tokens[2],tokens[4]]
            operator = tokens[3]
            storeVar = tokens[0]
        } else if (tokens[1]==="+=" || tokens[1]==="-=" || tokens[1]==="*=" || tokens[1]==="/=") { // var += 2 ; var += a
            op = "x="
            loadVars = [tokens[2],tokens[0]]
            operator = tokens[1]
            storeVar = tokens[0]
        } else if (tokens[1]==="++")  { //var ++
            loadVars = [tokens[0]]
            op = "++"
        } else if (tokens[1]==="--")  { //var --
            loadVars = [tokens[0]]
            op = "--"
        } else if (tokens[0]==="if") { //if (a>b) {}
            op = "if"
            condition = ifFunctions[ifF].condition
            condition = condition.replace(")","")
            condition = condition.replace("(","")
            jumpCondition = getCondtion(condition)
            loadVars = [jumpCondition[1],jumpCondition[2]]
            ifF++
        } else if (tokens[0]==="while") { //while (a>b) {}
            op = "while"
            condition = whileFunctions[whileF].condition
            condition = condition.replace(")","")
            condition = condition.replace("(","")
            jumpCondition = getCondtion(condition)
            loadVars= [jumpCondition[1],jumpCondition[2]]
            whileConditionEnd[whileF] = jumpCondition
            whileF++
        } else if (tokens[0]==="STAIP") {
            op="staip"
        } else if (tokens[0]==="run") { //run {function}
            op = "function"
            func = tokens[1]
        } else if (tokens[1]===">>") {  // var >>
            op = "shiftRight"
            loadVars = [tokens[0]]
        } else if (tokens[1]==="<<") { // var <<
            op = "shiftLeft"
            loadVars = [tokens[0]]
        } else if (tokens[1]==="~") { // var ~
            op = "not"
            loadVars = [tokens[0]]
        } else if (tokens[0]==="drawPixel()") { //drawPixel x y color
            op = "drawPixel"
            loadVars = [tokens[1],tokens[2],tokens[3]]
        } else if (tokens[0]==="setTimer()") { //setTimer timer ms*10
            op = "setTimer"
            loadVars = [tokens[1],tokens[2]]
        }

        let loadOp = ["LD","LD","LD","LD"]
        let lsOrReg = [true,true,true,true,true]
        let needRegs = [0,1,2,3,4]


//------------------------------------------------------------------------------------------------------REGS
        //check if the value is already in register
        for (let j = 0; j < registers.length; j++) {
            if (isNaN(registers[j]))  {
                if (registers[j] === loadVars[0]) {
                    regs[0]="r"+j
                    needRegs[0]=j
                    lsOrReg[0]=false
                } else if (registers[j] === loadVars[1]) {
                    regs[1]="r"+j
                    needRegs[1]=j
                    lsOrReg[1]=false
                } else if (registers[j] === loadVars[2]) {
                    regs[3]="r"+j
                    needRegs[3]=j
                    lsOrReg[3]=false
                } else if (registers[j] === loadVars[3]) {
                    regs[4]="r"+j
                    needRegs[4]=j
                    lsOrReg[4]=false
                } else if (registers[j] === storeVar) {
                    regs[2]="r"+j
                    needRegs[2]=j
                    lsOrReg[2]=false
                }
            }
        }

        let checkRegisterPointer = function() {
            if (needRegs.includes(registerPointer)) {
                registerPointer++
                if (registerPointer===cpuRegisters) {
                    registerPointer = 0
                }
                return false
            } else {
                return true
            }
        }

        let storeReg = function() {
            if (registers[registerPointer]!==undefined && registers[registerPointer]!==0 && isNaN(registers[registerPointer])) {
                let storeOp = "ST"
                if (allVars[registers[registerPointer]]===1) { storeOp="ST8"}
                realCode+= storeOp+" r"+registerPointer+" "+registers[registerPointer]+"\n"
                console.log(registers[registerPointer])
            }
        }

        //if not load the value
        if (lsOrReg[0]===true && loadVars[0]!==undefined) {
            let canLoad = false
            while(canLoad===false) {
                canLoad = checkRegisterPointer()
            }
            storeReg()
            needRegs[0] = registerPointer
            regs[0]="r"+registerPointer
            registers[registerPointer] = loadVars[0]
            registerPointer++
            if (registerPointer===cpuRegisters) {
                registerPointer = 0
            }
        }
        if (lsOrReg[1]===true && loadVars[1]!==undefined) {  //----------------------------------
            let canLoad = false
            while(canLoad===false) {
                canLoad = checkRegisterPointer()
            }
            storeReg()
            needRegs[1] = registerPointer
            regs[1]="r"+registerPointer
            registers[registerPointer] = loadVars[1]
            registerPointer++
            if (registerPointer===cpuRegisters) {
                registerPointer = 0
            }
        }
        if (lsOrReg[2]===true && storeVar!==undefined) {  //----------------------------------
            let canLoad = false
            while(canLoad===false) {
                canLoad = checkRegisterPointer()
            }
            storeReg()
            needRegs[2] = registerPointer
            regs[2]="r"+registerPointer
            registers[registerPointer] = storeVar
            registerPointer++
            if (registerPointer===cpuRegisters) {
                registerPointer = 0
            }
        }
        if (lsOrReg[3]===true && loadVars[2]!==undefined) {  //----------------------------------
            let canLoad = false
            while(canLoad===false) {
                canLoad = checkRegisterPointer()
            }
            storeReg()
            needRegs[3] = registerPointer
            regs[3]="r"+registerPointer
            registers[registerPointer] = loadVars[2]
            registerPointer++
            if (registerPointer===cpuRegisters) {
                registerPointer = 0
            }
        }
        if (lsOrReg[4]===true && loadVars[3]!==undefined) {  //----------------------------------
            let canLoad = false
            while(canLoad===false) {
                canLoad = checkRegisterPointer()
            }
            storeReg()
            needRegs[4] = registerPointer
            regs[4]="r"+registerPointer
            registers[registerPointer] = loadVars[3]
            registerPointer++
            if (registerPointer===cpuRegisters) {
                registerPointer = 0
            }
        }
//------------------------------------------------------------------------------------------------

        let loadVarFunction = function(lop,rg,lva,bit24 = 0) {
            let loadOp8bit = ""
            let loadOp24bitAddres = ""

            if (allVars[loadVars[lva]]===1) { loadOp8bit = "8"}
            if (bit24===1) { loadOp24bitAddres = "X"}

            if (!isNaN(+loadVars[lva])) {loadOp[lop]="LDI" }

            loadOp[lop]=loadOp[lop]+loadOp24bitAddres+loadOp8bit

            realCode+= loadOp[lop]+" "+regs[rg]+" "+loadVars[lva]+"\n"

        }


        if (op==="=") { //--------------------------------------------------------------------- + - * /
            if (lsOrReg[0]===true) {
                loadVarFunction(0, 0, 0)
            }
            if (lsOrReg[1]===true) {
                loadVarFunction(1, 1, 1)
            }
            realCode+= getOperator(operator)+" "+regs[0]+" "+regs[1]+" "+regs[2]+"\n"
        } else if (op==="==") {
            if (lsOrReg[1]===true) {
                loadVarFunction(0, 0, 0)
            }
            realCode+= "ST "+regs[0]+" "+storeVar+"\n"
        } else if (op==="x=") { //--------------------------------------------------------------------- += -= *= /=
            if (lsOrReg[0]===true) {
                loadVarFunction(0, 0, 0)
            }
            if (lsOrReg[1]===true) {
                loadVarFunction(1, 1, 1)
            }

            realCode+= getOperator(operator)+" "+regs[0]+" "+regs[1]+"\n"

        } else if (op==="if") {  //---------------------------------------------------------------------IF
              /*
               JNE if1n
               JSR if1
               <if1n>

               <if1>
               RFS
             */
              console.log(registers)
            if (lsOrReg[0]===true) {
                loadVarFunction(0, 0, 0)
            }
            if (lsOrReg[1]===true) {
                loadVarFunction(1, 1, 1)
            }

            realCode+= jumpCondition[0]+" "+regs[0]+" "+regs[1]+" if"+(ifF-1)+"n "+" \n"
            realCode+= "JSR if"+(ifF-1)+" \n"
            realCode+= "<if"+(ifF-1)+"n> \n"


        } else if (op==="while") {  //---------------------------------------------------------------------WHILE
         /*
         JNE while1n
         JSR while1
         <while1n>

         <while1>

         JE while1
         RFS
         */
            if (lsOrReg[0]===true) {
                loadVarFunction(0, 0, 0)
            }
            if (lsOrReg[1]===true) {
                loadVarFunction(1, 1, 1)
            }
            realCode+= jumpCondition[0]+" "+regs[0]+" "+regs[1]+" while"+(whileF-1)+"n "+" \n"
            realCode+= "JSR while"+(whileF-1)+" \n"
            realCode+= "<while"+(whileF-1)+"n> \n"
        } else if (op==="function") {  //---------------------------------------------------------------------FUNCTION
            realCode+= "JSR "+func+"\n"
        } else if (op==="++") {//---------------------------------------------------------------------INC
            if (lsOrReg[0]===true) {
                loadVarFunction(0, 0, 0)
            }
            realCode+= "INC "+regs[0]+"\n"
        } else if (op==="--") {//---------------------------------------------------------------------DEC
            if (lsOrReg[0]===true) {
                loadVarFunction(0, 0, 0)
            }
            realCode+= "DEC "+regs[0]+"\n"
        } else if (op==="shiftRight") {//---------------------------------------------------------------------SHIFT Right
            if (lsOrReg[0]===true) {
                loadVarFunction(0, 0, 0)
            }
            realCode+= "SHR "+regs[0]+"\n"
        } else if (op==="shiftLeft") {//---------------------------------------------------------------------SHIFT Left
            if (lsOrReg[0]===true) {
                loadVarFunction(0, 0, 0)
            }
            realCode+= "SHL "+regs[0]+"\n"
        } else if (op==="not") {//---------------------------------------------------------------------NOT
            if (lsOrReg[0]===true) {
                loadVarFunction(0, 0, 0)
            }
            realCode+= "NOT "+regs[0]+"\n"
        } else if (op==="drawPixel") {//---------------------------------------------------------------------DRAW PIXEL
            if (lsOrReg[0]===true) {
                loadVarFunction(0, 0, 0)
            }
            if (lsOrReg[1]===true) {
                loadVarFunction(1, 1, 1)
            }
            if (lsOrReg[3]===true) {
                loadVarFunction(3, 3, 2)
            }

            realCode+= "PSH r11 \n"
            realCode+= "PSH r12 \n"
            realCode+= "PSH r13 \n"

            realCode+= "TRR "+regs[0]+" r11 \n"
            realCode+= "TRR "+regs[1]+" r12 \n"
            realCode+= "TRR "+regs[3]+" r13 \n"

            realCode+= "JSR drawPixel_function_import\n"

            realCode+= "POP r13 \n"
            realCode+= "POP r12 \n"
            realCode+= "POP r11 \n"

        } else if (op==="setTimer") {//----------------------------------------------------------------Set Timer
            if (lsOrReg[1]===true) {
                loadVarFunction(1, 1, 1)
            }

            if (tokens[1]==0) {
                realCode+= "STX8 "+regs[1]+" $0A0010 \n"
            } else if (tokens[1]==1) {
                realCode+= "STX8 "+regs[1]+" $0A0011 \n"
            } else if (tokens[1]==2) {
                realCode+= "STX8 "+regs[1]+" $0A0012 \n"
            } else if (tokens[1]==3) {
                realCode+= "STX8 "+regs[1]+" $0A0013 \n"
            }
        } else if (op==="readKey") {//----------------------------------------------------------------Read Key
            realCode+= "JSR readKeyboardBuffer_import \n"
            realCode+= "PSH r0 \n"
            realCode+= "LD8 r0 keyboardBufferValueReturn_import \n"
            realCode+= "ST8 r0 "+storeVar+" \n"
            realCode+= "POP r0 \n"
        } else if (op==="staip") {//----------------------------------------------------------------Store address to interrupt pointer
            realCode+= "STAIP "+tokens[1]+" "+tokens[2]+" \n"
        } else if (op==="drawChar") {//----------------------------------------------------------------Draw character
            realCode+= "PSH r0 \n"
            realCode+= "LD8 r0 "+tokens[2]+" \n"
            realCode+= "ST8 r0 char_drawChar_import \n"
            realCode+= "POP r0 \n"
            realCode+= "JSR drawChar_function_import \n"
        }



    }

    //---------------------------------------------------------------------END

  /*  for (let a=0; a<cpuRegisters; a++) {   //store all regs to memory at the end of the function
        if (registers[a]!==0) {
            realCode+= "ST "+"r"+a+" "+registers[a]+"\n"
        }
    }*/

    //return
    if (type==="if" || type==="while" || type==="function" ) {
        if (type==="while") {
            //cringe
            let loadOp = ["LD","LD"]
            let regsWhile = ["r0","r1"]
            let needRegs = [0,1]
            let lsOrReg = [true,true]

            let checkRegisterPointer = function() {
                if (needRegs.includes(registerPointer)) {
                    registerPointer++
                    if (registerPointer===cpuRegisters) {
                        registerPointer = 0
                    }
                    return false
                } else {
                    return true
                }
            }

            let storeReg = function() {
                if (registers[registerPointer]!==0) {
                    let storeOp = "ST"
                    if (allVars[registers[registerPointer]]===1) { storeOp="ST8"}
                    realCode+= storeOp+" r"+registerPointer+" "+registers[registerPointer]+"\n"
                }
            }
            //check if the value is already in register
            for (let j = 0; j < registers.length; j++) {
                if (isNaN(registers[j])) {
                    if (registers[j] === whileConditionEnd[(whileF - 1)][1]) {
                        regsWhile[0] = "r" + j
                        needRegs[0] = j
                        lsOrReg[0] = false
                    } else if (registers[j] === whileConditionEnd[(whileF - 1)][2]) {
                        regsWhile[1] = "r" + j
                        needRegs[1] = j
                        lsOrReg[1] = false
                    }
                }
            }

            //if not load the value
            if (lsOrReg[0]===true) {
                let canLoad = false
                while(canLoad===false) {
                    canLoad = checkRegisterPointer()
                }
                storeReg()
                needRegs[0] = registerPointer
                regsWhile[0]="r"+registerPointer
                registers[registerPointer] = whileConditionEnd[(whileF-1)][1]

                registerPointer++
            }
            if (lsOrReg[1]===true) {  //----------------------------------
                let canLoad = false
                while(canLoad===false) {
                    canLoad = checkRegisterPointer()
                }
                storeReg()
                needRegs[1] = registerPointer
                regsWhile[1]="r"+registerPointer
                registers[registerPointer] = whileConditionEnd[(whileF-1)][2]
                registerPointer++
            }


            let loadVarFunction = function(lop,rg,lva,bit24 = 0) {
                let loadOp8bit = ""
                let loadOp24bitAddres = ""
                let loadVars = whileConditionEnd[(whileF-1)]

                if (allVars[loadVars[lva]]===1) { loadOp8bit = "8"}
                if (bit24===1) { loadOp24bitAddres = "X"}

                if (!isNaN(+loadVars[lva])) {loadOp[lop]="LDI" }

                loadOp[lop]=loadOp[lop]+loadOp24bitAddres+loadOp8bit

                realCode+= loadOp[lop]+" "+regsWhile[rg]+" "+loadVars[lva]+"\n"
            }

            if (lsOrReg[0]===true) {
                loadVarFunction(0, 0, 1)
            }
            if (lsOrReg[1]===true) {
                loadVarFunction(1, 1, 2)
            }


            realCode+= whileConditionEnd[(whileF-1)][3]+" "+regsWhile[0]+" "+regsWhile[1]+" "+"while"+(whileF-1)+" \n"
        }
        realCode+= "RFS \n"
    }


    return realCode
}



//-------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------CONSOLE.LOG
//-------------------------------------------------------------------------------------------------------------------
function test() {
    console.log("registers")
    console.log(registers)
    console.log("vars")
    console.log(vars)
    console.log("arrays")
    console.log(arrays)
    console.log("strings")
    console.log(strings)
    console.log("addresses")
    console.log(addresses)
    console.log("functions")
    console.log(functions)
    console.log("if functions")
    console.log(ifFunctions)
    console.log("while functions")
    console.log(whileFunctions)
    console.log("--------------")
    console.log(whileConditionEnd)
    console.log("vars size")
    console.log(allVars)
}


el_input.value = "function main {\n" +
    "\n" +
    "}\n"