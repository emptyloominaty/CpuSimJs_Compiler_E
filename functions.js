let getOperator = function(op) {
    if (op==="+") {
        return "ADD"
    } else if (op==="-") {
        return "SUB"
    } else if (op==="*") {
        return "MUL"
    } else if (op==="/") {
        return "DIV"
    } else if (op==="+=") {
        return "AD2"
    } else if (op==="-=") {
        return "SU2"
    } else if (op==="*=") {
        return "MU2"
    } else if (op==="/=") {
        return "DI2"
    } else if (op==="|") {
        return "OR"
    } else if (op==="&") {
        return "AND"
    } else if (op==="^") {
        return "XOR"
    }

}

let getCondtion = function(condition) {
    let conditionVals = [0,0]
    if (condition.indexOf("=")>0) {
        conditionVals = condition.split("=")
        return ["JNE",conditionVals[0],conditionVals[1],"JE"]
    } else if (condition.indexOf("!=")>0) {
        conditionVals = condition.split("!=")
        return ["JE",conditionVals[0],conditionVals[1],"JNE"]
    } else if (condition.indexOf(">")>0) {
        conditionVals = condition.split(">")
        return ["JNG",conditionVals[0],conditionVals[1],"JG"]
    } else if (condition.indexOf("<")>0) {
        conditionVals = condition.split("<")
        return ["JNL",conditionVals[0],conditionVals[1],"JL"]
    } else if (condition.indexOf("!>")>0) {
        conditionVals = condition.split("!>")
        return ["JG",conditionVals[0],conditionVals[1],"JNG"]
    } else if (condition.indexOf("!<")>0) {
        conditionVals = condition.split("!<")
        return ["JL",conditionVals[0],conditionVals[1],"JNL"]
    }
}

let getReal = function(d,da) {
    let r = 0
    for (let i = 0; i<=d; i++) {
        r += da[i]
    }
    return r
}