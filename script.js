
const Modal = {
    open(){
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close(){
        document.querySelector('.modal-overlay').classList.remove('active');
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('meuFinanceiro:transactions')) || [];
    },
    set(transactions){
        localStorage.setItem("meuFinanceiro:transactions", JSON.stringify(transactions))
    },
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction);
        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload();
    },

    icomes () {
        let icomes = 0;
        Transaction.all.forEach(transaction => {
            if( transaction.amount > 0 ){
                icomes += transaction.amount;
            }
        })
        return icomes

    },

    expenses () {
        let expenses = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0 ){
                expenses += transaction.amount;
            }
        })
        return expenses
    },

    total () {
        return Transaction.icomes() + Transaction.expenses();
    }

}

const Utils = {
    formatCurrency(valor){
        const signal = Number(valor) < 0 ? "-" : "";

        valor = String (valor).replace(/\D/g, "")

        valor = Number(valor) / 100;

        valor = valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + valor
    },

    formatAmount(valor){
        valor = Number(valor) * 100;
        return valor;
    },

    formtDate(date){
        const splitteDate = date.split("-")
        return`${splitteDate[2]}/${splitteDate[1]}/${splitteDate[0]}`
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#tabela-dados tbody'),

    addTransaction (transaction, index) {
        
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        DOM.transactionsContainer.appendChild(tr)
        
    },
    innerHTMLTransaction (transaction, index) {
        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
                <td>${transaction.description}</td>
                <td>${amount}</td>
                <td>${transaction.date}</td>
                <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Deletar" /></td>
        `
        return html;
    },

    updateBalance() {
        document.getElementById('entradas').innerHTML = Utils.formatCurrency(Transaction.icomes());
        document.getElementById('saidas').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('total').innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    
    getValues (){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value

        }
    },

    formtValues(){
        let { description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);

        date = Utils.formtDate(date);

        return {
            description,
            amount,
            date,
        }
    },

    validateFields(){
        const { description, amount, date } = Form.getValues();
        if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error("Por favor, preencha todos os campos.");
        }
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },






    submit (event){
        event.preventDefault();

        try {
            Form.validateFields();
            const transaction = Form.formtValues();
            Transaction.add(transaction);
            Form.clearFields();
            Modal.close();
            
            
        } catch (error) {
            alert(error.message);
        }
    },

    
}


const App = {
    init(){
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index);
        })

        DOM.updateBalance();

        Storage.set(Transaction.all);

    },
    reload(){
        DOM.clearTransactions();
        App.init();

    },

}


App.init();

