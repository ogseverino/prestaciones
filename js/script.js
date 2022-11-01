document.addEventListener('DOMContentLoaded', function() {
    ///////  EVENT LISTENERS  ////////

    //Add event listener to Date Pickers in order to enable salary inputs
    document.querySelector('#ingreso').addEventListener('change', function(e){
        enableInputs(e);
    })

    document.querySelector("#salida").addEventListener("change", function(e){
        enableInputs(e);
    })

    //Add event listener to calculate button
    document.querySelector("#calcular").addEventListener("click", calcular);

    //Add event listener on inputs in order to show completar button
    document.querySelectorAll('.table-input:not([data-type=total])').forEach(input => {
        input.addEventListener('focus', function(e){
            showCompletar(e);
        });
    }) 

    //Add Event Listener to Every Completar button
    document.querySelectorAll(".btnCalcular").forEach(button => {
        button.addEventListener('click', function(e){
            completar(e)
        })
    })

    document.querySelectorAll('[name=calculo').forEach(radio => {
        radio.addEventListener('click', function(e){
            changeText(e);
        });
    })


    //GLOBAL VARIABLES
    let inputAmount = 0;
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    ///////  FUNCTIONS  ////////

    //Change Text
    function changeText(e){
        if(e.target.id == "ordinario"){
            document.querySelector("#descripcion-calculo").innerHTML =  `
            Jornada ordinaria es la ejecutada por trabajadores dentro de un período que no exceda de ocho (8) horas al día ni de cuarenta y cuatro (44) a la semana.
            <br><br>
            <b>Referencias</b> <a href="http://mt.gob.do/images/docs/biblioteca/codigo_de_trabajo.pdf#page=62">Art. 147</a> del Codigo del Trabajo
            `
        }else{
            document.querySelector("#descripcion-calculo").innerHTML = `
            Jornada intermitente es la ejecutada por trabajadores que requieren su sola presencia en el lugar de trabajo, los cuales pudieran laborar consecuentemente por un periodo de hasta diez (10) horas diarias. Estos trabajadores son: los porteros, los ascensoristas, los serenos, los guardianes, los conserjes, los barberos, los sastres, los empleados de bombas para el expendio de gasolina, los capataces, los mozos de cafés y restaurantes, las manicuristas, los camareros, los trabajadores ocupados en vehículos de transporte terrestre que presten servicios intermitentes o entre dos o más municipios y los trabajadores del campo.
            <br><br>    
            <b>Referencias:</b> resolución <a href="http://mt.gob.do/images/docs/biblioteca/codigo_de_trabajo.pdf#page=250">04/93</a> del Ministerio de Trabajo, sobre trabajadores que ejecutan labores intermitentes, <a href="http://mt.gob.do/images/docs/biblioteca/codigo_de_trabajo.pdf#page=86">arts. 281, 284 y 285</a> del Código de Trabajo y <a href="http://mt.gob.do/images/docs/biblioteca/codigo_de_trabajo.pdf#page=45">art. 78</a> del Reglamento <a href="http://mt.gob.do/images/docs/biblioteca/codigo_de_trabajo.pdf#page=16">258/93</a> para la aplicación del Código de Trabajo. 
            `;
        }
    }

    function completar(e){

        //Get this button ID
        let id = Number(e.target.dataset.id);

        //Get value from this row's inputs
        let salario = document.querySelector(`#salario-${id}`).value;
        let comision = document.querySelector(`#comision-${id}`).value;
        let total = document.querySelector(`#total-${id}`).value;

        //Get all inputs spread them into an Array so I can use the filter method later
        let arrayNodes =[...document.querySelectorAll(".table-input")];

        //Filter array by getting the inputs
        let filteredInputs = arrayNodes.filter(inputs => Number(inputs.getAttribute('data-id')) > id && inputs.getAttribute('data-id') <= inputAmount);

        //Insert Values into Inputs
        filteredInputs.forEach(input => {
            //get input id
            let inputId = Number(input.getAttribute('data-id'))
            if(input.id == `salario-${inputId}`){
                input.value = salario
            }else if(input.id == `comision-${inputId}`){
                input.value = comision
            }else {
                input.value = total;
            }
        })
    }

    function showCompletar(e) {

        //Remove all Buttons
        document.querySelectorAll('.btnCalcular').forEach(button => button.style.display = 'none')
        //get id Value
        let id = e.target.getAttribute('data-id');
        let buttonToShow = document.querySelector(`.btnCalcular[data-id="${id}"]`);

        //Show Button
        buttonToShow.style.display = 'block';
    }

    //Function that is triggered whenever the date inputs are changed
    function enableInputs(e) {
        let ingreso = new Date(document.querySelector('#ingreso').value);
        let salida = new Date(document.querySelector('#salida').value);
        inputAmount = 0;

        if(ingreso == "Invalid Date" || salida == "Invalid Date") {
            return;
        }else {
            //Make month calculations
            let totalMonths = (salida.getFullYear() - ingreso.getFullYear()) * 12;
            totalMonths += salida.getMonth();
            totalMonths -= ingreso.getMonth();
                
            if(ingreso.getDate() > salida.getDate()){
                totalMonths-=1;
            }

            //Inject total month amount in a hidden input placed in the HTML. This value will be used for further calculations.
            document.querySelector("#totalMonths").value = totalMonths;
        
            //Get all table inputs, except for the total one. 
            let tableInputs = document.querySelectorAll('.table-input:not([data-type=total])');

            //Validate that the end date is not greater than the start date.
            if(totalMonths<0){
                alert("La fecha de ingreso no puede ser mayor a la fecha de salida");
                tableInputs.forEach(input => input.setAttribute('disabled', ""));
                return;
            }
            
            //That code returns a month difference of 1 as 0, so add one to the variable if the result is 0.
            if(totalMonths == 0){
                totalMonths++;
            }

            //Run a loop on the array of every input in order to remove the attribute of disabled.
            tableInputs.forEach(input => {
                //Which input am I running
                let iteration = input.getAttribute("data-id");

                //If the input I'm currently running on is lesser or equal to the total amount of months worked by the employee, remove the disabled attribute.
                if(iteration<=totalMonths){
                    input.removeAttribute("disabled")
                    inputAmount++;
                }else {
                    return;
                }

                //Add event listener to the newly enabled inputs in order to calculate the whatever the user types in them.
                input.addEventListener('change', function(e) {
                    calculateInput(e);
                });
                
            })
            
            //Since two inputs are being looped over per iteration, divide the input amount by 2 in order to get the real input amount. Input amount is a global variable being altered in this code and it will be used for further calculations.
            inputAmount = inputAmount / 2;
        }
    }

    //Function that calculates inputs and place the results in the total input
    function calculateInput(e) {

        //Validate if it's a number or not
        if(isNaN(e.target.value)){
            alert('Solo se permiten ingresar numeros');
            e.target.value = "";
            return;
        }

        //Get this Data ID
        let dataId = e.target.getAttribute("data-id");
        //Get Salary and Comision Value
        let salary = Number(document.querySelector(`#salario-${dataId}`).value)
        let comission = Number(document.querySelector(`#comision-${dataId}`).value)

        //Inject sum of salary + comission into total input
        document.querySelector(`#total-${dataId}`).value = salary + comission;


    }


    //Function that is triggered whenever the Calculate button is clicked
    function calcular(){

        //SALARIO DIARIO AND TIEMPO LABORADO CALCULATION

        //SALARIO DIARIO, SUMATORIA DE LOS SALARIOS, SALARIO PROMEDIO MENSUAL.
        //Select frequency of payment
        let frequency = document.querySelector("[name=periodo]:checked").id;
        
        //Determine factor of calculation on frequency selected;
        let factor;

        let monthAmount = Number(document.querySelector("#totalMonths").value);

        if(monthAmount > 12){
            monthAmount = 12;
        }

        //Check for type of calculation first
        let tipoCalculo = document.querySelector('[name=calculo]:checked').id;

        //Determine factor depending on frequency.
        if(tipoCalculo == "ordinario"){
            if(frequency == "mensual"){
                factor = 23.83;
            }else if(frequency == "quincenal"){
                factor = 11.91
            }else if(frequency == "semanal"){
                factor = 5.5
            }else{
                factor = 1;
            }
        }else{
            if(frequency == "mensual"){
                factor = 26;
            }else if(frequency == "quincenal"){
                factor = 13;
            }else if(frequency == "semanal"){
                factor = 6;
            }else{
                factor = 1;
            }   
        }
        //Calculate sum of all salaries
        //Select all total inputs
        let totalInputs = document.querySelectorAll('[data-type=total]');
        let allSalaries = 0;
        let averageMonthly = 0;
        let averageDaily = 0;

        totalInputs.forEach(input => allSalaries = allSalaries + Number(input.value));
        averageMonthly = allSalaries / monthAmount;
        averageDaily = Number(averageMonthly / factor);
        averageDaily = averageDaily.toFixed(2);

        
        //Inject into output;
        document.querySelector("#allSalaries").innerHTML = `RD${formatter.format(allSalaries)}`;
        document.querySelector("#averageMonthly").innerHTML = `RD${formatter.format(averageMonthly)}`;
        document.querySelector("#averageDaily").innerHTML = `RD${formatter.format(averageDaily)}`;

        //TIEMPO LABORADO
        //Get Date Difference
        let inicio = moment(document.querySelector('#ingreso').value);
        let fin = moment(document.querySelector('#salida').value)

        let diff = moment.preciseDiff(inicio, fin, true);

        //Create text that will be injected into the HTML based on conditions.
        let dateMessage = ""
        if(diff.years){
            dateMessage+=`${diff.years} años`
        }
        if (diff.months) {
            if(diff.years !== 0){
                dateMessage+=`, `
            }
            dateMessage+=`${diff.months} meses`
        }

        if(diff.days){
            if(diff.months !== 0){
                dateMessage+=` y  `
            }
            dateMessage+=`${diff.days} dias`
        }

        //Inject into the HTML
        document.querySelector("#date-difference").innerHTML = dateMessage;

        let preaviso = 0;
        let cesantia = 0;
        let vacaciones = 0;
        let navidad = 0;
        

        //PREAVISO
        let preavisoValue = Number(document.querySelector("#radioPreaviso").checked);
        //Check if the preaviso radio button is unchecked
        if(!preavisoValue){

            let diasPreaviso = 0;

            //Define amount of days based on conditions
            if(diff.years == 0 && (diff.months > 2 && diff.months < 7)) {
                diasPreaviso = 7;
            }
            if(diff.years == 0 && (diff.months > 5 && diff.months < 13)){
                diasPreaviso = 14;
            }
            if(diff.years) {
                diasPreaviso = 28;
            }
        
            //Calculate
            preaviso = averageDaily * diasPreaviso;
        
            //Inject Preaviso into HTML
            document.querySelector('#montoPreaviso').innerHTML = `RD${formatter.format(preaviso.toFixed(2))} (${diasPreaviso} dias)`;
        }else{
            document.querySelector('#montoPreaviso').innerHTML = `RD${formatter.format(0)}`;

        }

        //CESANTIA
        //Check if cesantia radio button is checked
        if(Number(document.querySelector("#radioCesantia").checked)){
            let diasCesantia = 0;

            //Define amount of days based on conditions
            if(diff.years == 0 && (diff.months > 2 && diff.months < 7)) {
                diasCesantia = 6;
            }
            if(diff.years == 0 && (diff.months >= 6)){
                diasCesantia = 13;
            }
            if(diff.years >= 1 && diff.years<5) {
                diasCesantia = diff.years * (21);
                if(diff.months >= 3 && diff.months<6){
                    diasCesantia = diasCesantia + 6;
                }
                if(diff.months >= 6 && diff.months<12){
                    diasCesantia = diasCesantia + 13;
                }
            }
            if(diff.years >= 5){
                diasCesantia = diff.years * (23);
                if(diff.months >= 3 && diff.months<=6){
                    diasCesantia = diasCesantia + 6;
                }
                if(diff.months > 6 && diff.months<12){
                    diasCesantia = diasCesantia + 13;
                }
            }

            //Calculate Cesantia
            cesantia = diasCesantia * averageDaily;

            //Inject into HTML
            document.querySelector("#cesantiaText").innerHTML = `RD${formatter.format(cesantia.toFixed(2))} (${diasCesantia} dias)`;
        }else{
            document.querySelector("#cesantiaText").innerHTML = `RD${formatter.format(0)}`;
        }

        //VACACIONES
        //IF UNDER A YEAR BUT ABOVE 5 MONTHS
        let diasVacaciones = 0;
        if(diff.years == 0 && diff.months>= 5 ){
            if(diff.months == 5){
                diasVacaciones = 6;
            }

            if(diff.months == 6){
                diasVacaciones = 7;
            }
            if(diff.months == 7){
                diasVacaciones = 8;
            }
            if(diff.months == 8){
                diasVacaciones = 9;
            }
            if(diff.months == 9){
                diasVacaciones = 10;
            }
            if(diff.months == 10){
                diasVacaciones = 11;
            }

            if(diff.months == 11){
                diasVacaciones = 12;
            }

            //Calculate Vacaciones
            vacaciones = diasVacaciones * averageDaily;

            //Inject into HTML
            document.querySelector("#vacacionesText").innerHTML = `${formatter.format(vacaciones.toFixed(2))} (${diasVacaciones} dias)`;         


        }   

        //Over a year but hasn't taken vacations
        if(diff.years > 0 && !document.querySelector('#radioVacaciones').checked){ 
            if(!Number(document.querySelector("#radioVacaciones").checked)){

                //Define amount of days based on conditions
                if(diff.years >= 1 && diff.years < 5) {
                    diasVacaciones = 14;
                }

                if(diff.years >=5){
                    diasVacaciones = 18;
                } 

                //Calculate Vacaciones
                vacaciones = diasVacaciones * averageDaily;

                //Inject into HTML
                document.querySelector("#vacacionesText").innerHTML = `${formatter.format(vacaciones.toFixed(2))} (${diasVacaciones} dias)`;            
            }else {
                document.querySelector("#vacacionesText").innerHTML = `RD${formatter.format(0)}`;
            }
        }

        //Over a year but did take vacations
        if(diff.years > 0 && document.querySelector('#radioVacaciones').checked){
            if(diff.months == 5){
                diasVacaciones = 6;
            }

            if(diff.months == 6){
                diasVacaciones = 7;
            }
            if(diff.months == 7){
                diasVacaciones = 8;
            }
            if(diff.months == 8){
                diasVacaciones = 9;
            }
            if(diff.months == 9){
                diasVacaciones = 10;
            }
            if(diff.months == 10){
                diasVacaciones = 11;
            }

            if(diff.months == 11){
                diasVacaciones = 12;
            }

            //Calculate Vacaciones
            vacaciones = diasVacaciones * averageDaily;

            //Inject into HTML
            document.querySelector("#vacacionesText").innerHTML = `${formatter.format(vacaciones.toFixed(2))} (${diasVacaciones} dias)`;           
        }


        //NAVIDAD
        //Check if navidad radio button is checked
        if(Number(document.querySelector("#radioNavidad").checked)){
            //Use MomentJS to subtract the total months of the end date to itself. This way it will always give me the first month of the year, which is what I want for this calculation.
            let firstMonthYear = moment(fin).subtract(fin.month(), 'months');
            let firstDayYear = moment(firstMonthYear).subtract(fin.day(), 'days');

            //Use MomentJS to calculate the difference between the end date and the first day of the year.
            let differenceDates = moment.preciseDiff(moment(firstDayYear._i).month(), fin, true);
            let monthDifference = differenceDates.months+1;
            let dayDifference  = differenceDates.days;

            //Get the total month difference between the end date and the start date (NOT the first month of the year, the start date)
            let totalMonthDifference = fin.diff(inicio, 'months');
            
            
            if(totalMonthDifference>12){
                totalMonthDifference = 12;
            }

            if(dayDifference < 31){
                dayDifference++;
                monthDifference-=1;
            }

            let monthFactor = 0;

            //Calculate month factor depending on what month it is. Month Factor determines if the month is 31 days, 30 days or 28 days.
            if(monthDifference<8){
                if(monthDifference%2==0 || monthDifference == 7){
                    monthFactor = 31;
                }else if(monthDifference == 1){
                    monthFactor = 28;
                }else{
                    monthFactor = 30;
                }
            }else{
                if(monthDifference%2!=0){
                    monthFactor = 31;
                }else{
                    monthFactor = 30;
                }               
            }

            
            //Get monthly salary
            let monthlySalary = allSalaries/totalMonthDifference;

            if(frequency === "mensual"){
                //Calculate navidad
                navidad = ((monthDifference * (monthlySalary))/12) + (((monthlySalary)*(dayDifference/monthFactor))/12);
            }else if(frequency==="quincenal"){
                //Calculate navidad
                navidad = (((monthlySalary*2)/12)*monthDifference) + (((monthlySalary*2) * (dayDifference/monthFactor)/12));  
            }else if(frequency ==="semanal"){
                navidad = (((monthlySalary*4.3334)/12)*monthDifference) + (((monthlySalary*4.3334) * (dayDifference/monthFactor)/12));  
            }else if(frequency==="diario"){
                navidad = (((monthlySalary*23.83)/12)*monthDifference) + (((monthlySalary*23.83) * (dayDifference/monthFactor)/12));  
            }



            //Inject into HTML
            document.querySelector("#navidadText").innerHTML = `${formatter.format(navidad.toFixed(2))} (${monthDifference} meses y ${dayDifference} dias)`;    
            
        }else {
            //If radio button is unchecked, inject 0 into the HTML
            document.querySelector("#navidadText").innerHTML = `RD${formatter.format(0)}`;
        }
        
        //SUBTOTAL 
        let subtotal = Number(preaviso.toFixed(2)) + Number(cesantia.toFixed(2)) + Number(vacaciones.toFixed(2));
        document.querySelector("#subtotalText").innerHTML = `RD${formatter.format(subtotal.toFixed(2))}`;

        //TOTAL
        let total = Number(subtotal.toFixed(2)) + Number(navidad.toFixed(2));
        document.querySelector('#totalText').innerHTML = `RD${formatter.format(total.toFixed(2))}`;
    }
})