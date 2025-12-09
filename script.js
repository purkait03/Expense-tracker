$(document).ready(function () {
    let transactions = JSON.parse(localStorage.getItem("transaction")) || []
    let count = transactions.length;
    let expenseChart;

    function createTransaction() {
        let amount = $('#amount').val()
        let type = $('input[name="type"]:checked').val()

        if (type == "expense") {
            amount = -Math.abs(amount)
        } else {
            amount = Math.abs(amount)
        }

        let newTxn = {
            id: ++count,
            type,
            description: $("#description").val(),
            amount,
            date: $('#date').val() || new Date().toISOString().split("T")[0]
        }


        return newTxn
    }

    function storingLocals() {
        let transactions = JSON.parse(localStorage.getItem("transaction")) || [];
        let newTxn = createTransaction()
        transactions.push(newTxn)

        localStorage.setItem("transaction", JSON.stringify(transactions))

        return newTxn
    }

    function calIncome() {
        let stored = JSON.parse(localStorage.getItem("transaction")) || [];


        if (stored) {

            let incomes = stored.filter(txn => txn.type == "income")

            let totalIncome = 0

            incomes.forEach(txn => {
                totalIncome = txn.amount + totalIncome
            });

            return totalIncome

        } else {
            return stored
        }

    }

    function calExpense() {
        let stored = JSON.parse(localStorage.getItem("transaction")) || [];


        if (stored) {

            let expenses = stored.filter(txn => txn.type == "expense")


            let totalExpenses = 0

            expenses.forEach(txn => {
                totalExpenses = txn.amount + totalExpenses
            });

            return Math.abs(totalExpenses)

        } else {
            return stored
        }

    }

    function renderChart() {
        let transactions = JSON.parse(localStorage.getItem("transaction")) || []

        let income = transactions
            .filter(txn => txn.type == "income")
            .reduce((sum, txn) => sum + txn.amount, 0)

        let expense = transactions
            .filter(txn => txn.type == "expense")
            .reduce((sum, txn) => sum + Math.abs(txn.amount), 0)

        let ctx = $('#summaryChart')[0].getContext("2d")

        if (expenseChart) {
            expenseChart.destroy();
        }

        expenseChart = new Chart(ctx, {
            type: "pie",
            data : {
                labels:["Income","Expense"],
                datasets: [{
                    data : [income, expense],
                    backgroundColor : ["#16a34a", "#dc2626"]
                }]
            },
            options : {
                responsive : true,
                plugins : {
                    legend : {
                        position : "bottom"
                    }
                }
            }
        })
    }

    function renderDetails() {
        $("#transaction-list").empty();

        let transactions = JSON.parse(localStorage.getItem("transaction")) || []

        let totalIncomes = calIncome();
        let totalExpenses = calExpense();
        let balance = totalIncomes - totalExpenses;


        $('#balance').text("₹" + balance);
        $('#income').text("₹" + (totalIncomes || 0));
        $('#expense').text("₹" + (totalExpenses || 0));

        transactions.forEach(txn => {
            let color = txn.amount >= 0 ? "text-green-600" : "text-red-600";
            let sign = txn.amount >= 0 ? "+" : "-";

            $('#transaction-list').prepend(`
        <li class="${color}">${txn.date} ${txn.description} | ${sign}${Math.abs(txn.amount)}
          <button class="delete-btn text-red-500 hover:text-red-700" data-id="${txn.id}">❌</button>
        </li>
      `);
        })

        renderChart()
    }

    $('#transaction-form').submit(function addTransaction(e) {

        e.preventDefault()

        let newTxn = storingLocals()
        renderDetails()


        this.reset()

    })




    $(document).on('click', '.delete-btn', function () {
        let id = $(this).data("id");
        let transactions = JSON.parse(localStorage.getItem("transaction")) || [];
        transactions = transactions.filter(txn => txn.id !== id);
        localStorage.setItem("transaction", JSON.stringify(transactions));
        renderDetails();
    });

    renderDetails()

})