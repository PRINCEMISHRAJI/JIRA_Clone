let addbtn = document.querySelector(".add-btn");
let removebtn = document.querySelector(".remove-btn");
let modalCont = document.querySelector(".modal-container");
let mainCont = document.querySelector(".main-container");
let textArea = document.querySelector(".textarea-cont");
let allPriorityColors = document.querySelectorAll(".priority-color");
let lockElem = document.querySelector(".ticket-lock");
let toolboxColors = document.querySelectorAll(".color");

let colors = [ "lightpink", "lightblue", "lightgreen", "black"];
let modalPriorityColor = colors[colors.length-1];

let addFlag = false;
let removeFlag = false;

let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let ticketsArr = [];

if(localStorage.getItem("jira-tickets")){
    //Retrieve and display tickets
    ticketsArr = JSON.parse(localStorage.getItem("jira-tickets"));
    ticketsArr.forEach( (ticketObj) =>{
        createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
    })
}

for(let i=0; i<toolboxColors.length; i++){
    toolboxColors[i].addEventListener("click", (e) =>{
        let currentToolboxColor = toolboxColors[i].classList[0];

        let filteredTickets = ticketsArr.filter((ticketObj, index) => {
            return currentToolboxColor === ticketObj.ticketColor;
        })

        // Remove Previous tickets
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for( let j =0; j<allTicketsCont.length; j++){
            allTicketsCont[j].remove();
        }

        // Display New Filtered Tickets
        filteredTickets.forEach( (ticketObj, index) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
        })
    });

    toolboxColors[i].addEventListener("dblclick", (e) => {
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for( let j =0; j<allTicketsCont.length; j++){
            allTicketsCont[j].remove();
        }

        ticketsArr.forEach( (ticketObj, index) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
        })
    })
}
// Listener for modal Priority Coloring
allPriorityColors.forEach((colorElem, index) => {
    colorElem.addEventListener("click", (e)=> {
        allPriorityColors.forEach((priorityColorElem, index) => {
            priorityColorElem.classList.remove("border");
        })
        colorElem.classList.add("border");
        modalPriorityColor = colorElem.classList[0];
    })
})

addbtn.addEventListener("click", (e)=>{
    //Display Modal
    addFlag = !addFlag;
    if(addFlag){
        modalCont.style.display = "flex";
    } else {
        modalCont.style.display = "none";
    }    
    //Generate Ticket
})

removebtn.addEventListener("click", (e) =>{
    removeFlag = !removeFlag;
})

modalCont.addEventListener("keydown", (e)=>{
    let key = e.key;
    if(key === "Shift" ){
        createTicket(modalPriorityColor, textArea.value);
        addFlag = false;
        setModalToDefaultSettings();  
    }
})

function createTicket(ticketColor, ticketTask, ticketID){
    let id = ticketID || shortid();
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-cont");
    ticketCont.innerHTML = `
    <div class="ticket-color ${ticketColor}"></div>
    <div class="ticket-id">#${id}</div>
        <div class="task-area">${ticketTask}</div>
        <div class="ticket-lock">
        <i class="fas fa-lock"></i>
            </div>
        `;
    mainCont.appendChild(ticketCont);
    
    // Create object of Ticket and add to array
    if(!ticketID){
        ticketsArr.push({ ticketColor, ticketTask, ticketID : id });
        localStorage.setItem("jira-tickets", JSON.stringify(ticketsArr));
    } 
    handleRemoval(ticketCont, id);
    handleLock(ticketCont, id);
    handleColor(ticketCont, id);

}

function handleRemoval(ticket, id){
    // console.log(removeFlag);
    ticket.addEventListener("click", (e) => {

        if(!removeFlag) return;

        // DB removal
        let ticketIndex = getTicketIndex(id);
        ticketsArr.splice(ticketIndex, 1);
        let stringTicketsArr = JSON.stringify(ticketsArr);
        localStorage.setItem("jira-tickets", stringTicketsArr);
        ticket.remove(); //UI Removal

        // If remove-> true -> remove ticket 
        // // if(removeFlag) ticket.remove();
        // if(removeFlag){
        //     let allTickets = document.querySelectorAll(".ticket-cont");
        //     allTickets.forEach( (ticket) => {
        //         ticket.addEventListener("click", (e) => {
            //             ticket.remove();
            //         })
        //     })
        // }
        // console.log(ticketsArr);
        // // if(removeFlag) console.log("handleremoval");
    })
}

function handleLock(ticket, id){
    let ticketLockElem = ticket.querySelector(".ticket-lock");
    let ticketLock = ticketLockElem.children[0];
    let ticketTaskarea =ticket.querySelector(".task-area");
    ticketLock.addEventListener("click", (e) => {
        let ticketIndex = getTicketIndex(id);
        if(ticketLock.classList.contains(lockClass)){
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskarea.setAttribute("contenteditable", "true");
        }else{
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskarea.setAttribute("contenteditable", "false");
        }
        // Modify data in localstorage -> Ticket Task
        ticketsArr[ticketIndex].ticketTask = ticketTaskarea.innerText;
        localStorage.setItem("jira-tickets", JSON.stringify(ticketsArr));
    })
 }

function handleColor(ticket, id){
    let ticketColor = ticket.querySelector(".ticket-color");
    ticketColor.addEventListener("click", (e) => {
        // Get ticket index from the tickets array
        let ticketIndex = getTicketIndex(id);

        let currentTicketColor = ticketColor.classList[1];
        // Get Ticket Color Index
        let currentTicketColorIndex = colors.findIndex((color) =>{
            return currentTicketColor === color;
        })
        currentTicketColorIndex++;
        let newTicketColorIndex = currentTicketColorIndex % colors.length;
        let newTicketColor = colors[newTicketColorIndex];
        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newTicketColor);

        // Modify data in LocalStorage -> Priority color change
        ticketsArr[ticketIndex].ticketColor = newTicketColor;
        localStorage.setItem("jira-tickets", JSON.stringify(ticketsArr));
    })
}

function getTicketIndex(id){
    let ticketIndex = ticketsArr.findIndex( (ticketObj) => {
        return ticketObj.ticketID === id;
    })
    return ticketIndex;
}

function setModalToDefaultSettings(){
    modalCont.style.display = "none";
    textArea.value = "";
    modalPriorityColor = colors[colors.length-1];
    allPriorityColors.forEach((priorityColorElem, index) => {
        priorityColorElem.classList.remove("border");
    })
    allPriorityColors[allPriorityColors.length-1].classList.add("border");
}