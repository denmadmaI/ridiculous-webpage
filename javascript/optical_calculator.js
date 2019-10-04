class FormClass {
    constructor(formName) {
        let fieldSet    = document.createElement("fieldset");
        let myForm      = document.getElementById(formName);
        this.form       = formName;
        this.mode       = "Tx";
        this.TxExp      = "In Tx mode, OMA is the calculated quantity.";
        this.RxExp      = "In Rx mode, Optical Power is the calculated quantity.";
        this.Pavg       = -15;
        this.Punit      = "dBm";
        this.OMA        = 0;
        this.OMAunit    = "dBm";
        this.ER         = 3;
        this.ERunit     = "abs";
        this.Rho        = 0.85;
        this.Tz         = 8;
        this.Ipkpk      = 0;
        this.Vpkpk      = 0;
              
        this.OMAUpdate();                 

        fieldSet.id     = "FormFieldSet";
        fieldSet.appendChild(this.createSelection("Mode", "Mode", ["Tx", "Rx"], this.TxExp));   
        fieldSet.appendChild(this.createTextBox("Pavg", "Optical Power", this.Pavg, ["dBm", "mW"]));        
        fieldSet.appendChild(this.createTextBox("OMA", "OMA", this.OMA, ["dBm", "mW"]));        
        fieldSet.appendChild(this.createTextBox("ER", "ER", this.ER, ["abs", "dB"]));
        let newDiv      = document.createElement("div");
        newDiv.className= "pure-control-group";
        newDiv.id       = "Rx_stuff";
        newDiv.style.visibility = "hidden";
        fieldSet.appendChild(newDiv);
        newDiv.appendChild(this.createTextBox("Rho", "Responsivity", this.Rho, ["A/W"]));    
        newDiv.appendChild(this.createTextBox("Tz", "Transimpedance", this.Tz, ["kΩ"]));                   
        newDiv.appendChild(this.createTextBox("Vpkpk", "Vpk-pk", this.Vpkpk, ["mV"]));                   
        myForm.appendChild(fieldSet);
    }

    createSelection(id, label, modeList = undefined, explanation = "") {
        let newDiv          = document.createElement("div");
        newDiv.className    = "pure-control-group";
        let newLabel        = document.createElement("label");
        newLabel.htmlFor    = id;
        newLabel.innerHTML  = label;
        newDiv.appendChild(newLabel);
        let newSelect       = document.createElement("select");
        newSelect.id        = id + "-selection";
        if (modeList != undefined) {
            if (modeList.length > 1) {            
                for (let mode of modeList) {
                    let option      = document.createElement("option");
                    option.innerHTML= mode;
                    newSelect.appendChild(option);
                }    
                newDiv.appendChild(newSelect);                  
            }
        }
        let newExplanation          = document.createElement("span");
        newExplanation.className   = "pure-form-message-inline";
        newExplanation.id          = id + "-explanation";
        newExplanation.innerHTML   = explanation;
        newDiv.appendChild(newExplanation);    
        return newDiv;
    }
    
    createTextBox(id, label, defaultValue, unitList = undefined) {
        let newDiv          = document.createElement("div");
        newDiv.className    = "pure-control-group";
        let newLabel        = document.createElement("label");
        newLabel.htmlFor    = id;
        newLabel.innerHTML  = label;
        newDiv.appendChild(newLabel);
        let newInput        = document.createElement("input");
        newInput.id         = id;
        newInput.type       = "text";
        newInput.value      = defaultValue;
        newDiv.appendChild(newInput);
        if (unitList != undefined) {
            if (unitList.length > 1) {            
                let newSelect       = document.createElement("select");
                newSelect.id        = id + "-unit";
                for (let unit of unitList) {
                    let option      = document.createElement("option");
                    option.innerHTML= unit;
                    newSelect.appendChild(option);
                }    
                newDiv.appendChild(newSelect);                  
            } else {
                let newUnit         = document.createElement("span");
                newUnit.id          = id + "-unit";           
                newUnit.className   = "pure-form-message-inline";
                newUnit.innerHTML   = unitList[0];
                newDiv.appendChild(newUnit);                      
            }
         }

        return newDiv;
    }

    updateFormEntries() {
        document.getElementById(this.form).innerHTML = "Tada! " + this.Pavg + " dBm";
    }

    OMAUpdate() {
        let Pavg    = (this.Punit == "dBm")?(Math.pow(10, this.Pavg/10)):this.Pavg;
        let ER      = (this.ERunit == "dB")?(Math.pow(10, this.ER/10)):this.ER;
        let P1      = (2*Pavg)/(1+1/ER);
        let P0      = (2*Pavg)/(1+ER);
        this.OMA    = (this.OMAunit == "dBm")?(Math.log10(P1-P0)*10):(P1-P0);
        this.VpkpkUpdate();
    }

    PUpdate() {     
        let OMA     = (this.OMAunit == "dBm")?(Math.pow(10, this.OMA/10)):this.OMA;
        let ER      = (this.ERunit == "dB")?(Math.pow(10, this.ER/10)):this.ER;
        let P1      = OMA/(1 - (1/ER));
        let P0      = OMA/(ER - 1);
        this.Pavg   = (this.Punit == "dBm")?(Math.log10((P1+P0)/2)*10):((P1+P0)/2);
        this.VpkpkUpdate();
    }

    VpkpkUpdate() {
        this.Ipkpk = ((this.OMAunit == "dBm")?(Math.pow(10, this.OMA/10)):this.OMA)*this.Rho;
        this.Vpkpk = this.Ipkpk*this.Tz*1000;
    }
}

var optical;

function init(formName) {
    optical = new FormClass(formName);
    document.querySelector('#message_space').textContent = "Working fine...";
}

function update() {
    let calcValue = 0;
    let formItemID = event.target.id;

    switch(formItemID){
        case "Mode-selection":
            if(document.querySelector("#Mode-selection").value == "Tx") {
                document.querySelector("#Rx_stuff").style.visibility = "hidden";             
            }
            else {
                document.querySelector("#Rx_stuff").style.visibility = "visible";             
            }
            document.querySelector("#Mode-explanation").innerHTML = optical[document.querySelector("#Mode-selection").value + "Exp"];
            break;        
        case "Pavg":
            if(document.querySelector("#Mode-selection").value == "Tx") {
                if (event.target.value.match(/^-?\d*(\.\d+)?$/)) {
                    optical.Pavg = parseFloat(event.target.value);
                }
                else {
                    event.target.value = optical.Pavg;                   
                }
                optical.OMAUpdate(); 
                document.querySelector("#OMA").value = optical.OMA;
                document.querySelector("#Vpkpk").value= optical.Vpkpk;                  
            } else {
                event.target.value = optical.Pavg;                
            }            
            document.querySelector('#message_space').textContent = "Pavg";
            break;
        case "OMA":
            if(document.querySelector("#Mode-selection").value == "Rx") {
                if (event.target.value.match(/^-?\d*(\.\d+)?$/)) {
                    optical.OMA = parseFloat(event.target.value);
                }
                else {
                    event.target.value = optical.OMA;                   
                }
                optical.PUpdate(); 
                document.querySelector("#Pavg").value = optical.Pavg;
                document.querySelector("#Vpkpk").value= optical.Vpkpk;                  
            } else {
                event.target.value = optical.OMA;                   
            }                    
            document.querySelector('#message_space').textContent = "OMA";
            break;
        case "ER":
            if(document.querySelector("#Mode-selection").value == "Tx") {
                if (event.target.value.match(/^-?\d*(\.\d+)?$/)) {
                    optical.ER = parseFloat(event.target.value);
                } else {
                    event.target.value = optical.ER;
                }
                optical.OMAUpdate(); 
                document.querySelector("#OMA").value = optical.OMA;
                document.querySelector("#Vpkpk").value= optical.Vpkpk;                  
            } else {
                if (event.target.value.match(/^-?\d*(\.\d+)?$/)) {
                    optical.ER = parseFloat(event.target.value);
                } else {
                    event.target.value = optical.ER;
                }
                optical.PUpdate(); 
                document.querySelector("#Pavg").value = optical.Pavg;                
            }
            document.querySelector('#message_space').textContent = "ER";
            break;
        case "Pavg-unit":
            optical.Punit = event.target.value;   
            if(document.querySelector("#Mode-selection").value == "Tx") {
                optical.OMAUpdate(); 
                document.querySelector("#OMA").value = optical.OMA;     
                document.querySelector("#Vpkpk").value= optical.Vpkpk;                             
            } else {
                optical.PUpdate(); 
                document.querySelector("#Pavg").value = optical.Pavg;   
                document.querySelector("#Vpkpk").value= optical.Vpkpk;                   
            }                       
            document.querySelector('#message_space').textContent = "Punit is " + optical.Punit;
            break;             
        case "OMA-unit":
            optical.OMAunit = event.target.value;
            if(document.querySelector("#Mode-selection").value == "Tx") {
                optical.OMAUpdate(); 
                document.querySelector("#OMA").value = optical.OMA;                
                document.querySelector("#Vpkpk").value= optical.Vpkpk;                  
            } else {
                optical.PUpdate(); 
                document.querySelector("#Pavg").value = optical.Pavg;
                document.querySelector("#Vpkpk").value= optical.Vpkpk;                      
            }                   
            document.querySelector('#message_space').textContent = "OMAunit";
            break;
        case "ER-unit":
            optical.ERunit = event.target.value;   
            if(document.querySelector("#Mode-selection").value == "Tx") {
                optical.OMAUpdate(); 
                document.querySelector("#OMA").value = optical.OMA;
                document.querySelector("#Vpkpk").value= optical.Vpkpk;                                  
            } else {
                optical.PUpdate(); 
                document.querySelector("#Pavg").value = optical.Pavg;   
                document.querySelector("#Vpkpk").value= optical.Vpkpk;                   
            }                   
            document.querySelector('#message_space').textContent = "ERunit is " + optical.ERunit;
            break;
        case "Rho":               
            if (event.target.value.match(/^-?\d*(\.\d+)?$/)) {
                optical.Rho = parseFloat(event.target.value);
                optical.VpkpkUpdate();
                document.querySelector("#Vpkpk").value= optical.Vpkpk;                 
            } else {
                event.target.value = optical.Rho;
            }
            break;
        case "Tz":               
            if (event.target.value.match(/^-?\d*(\.\d+)?$/)) {
                optical.Tz = parseFloat(event.target.value);
                optical.VpkpkUpdate();
                document.querySelector("#Vpkpk").value= optical.Vpkpk;                 
            } else {
                event.target.value = optical.Tz;
            }
            break;                        
        case "Vpkpk":               
            event.target.value = optical.Vpkpk;
            break;
        default:
            document.querySelector('#message_space').textContent = "Unknown selection";
            break;            
    }
}
