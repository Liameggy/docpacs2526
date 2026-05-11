const csv = require('csv-parser')
const fs = require('fs')
const orders = [];

fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (data) => {
        if (orders.length == 0 || data.Name !== orders[orders.length - 1].Name) {
            orders.push({
                Name: data.Name, Address: data.Address, Items: []
            })
        }

        orders[orders.length - 1].Items.push({
            Item: data.Item,
            QTY: data.QTY,
            Price: data.Price
        })
    })
    .on('end', () => {
            console.log(`-------------------------------------------------------------------------------------`)
        orders.forEach(order => {
            let subtotal = 0
            let salesTax = 0
            let shipping = 0
            let grandTotal = 0

            console.log(`Name:\t\t${order.Name}\tAddress:\t${order.Address}\n`)
            console.log(`QTY:\t\tPrice:\t\tTotal:\t\tItem:`)
            for (Item of order.Items) {
                let total = Item.QTY * parseFloat(Item.Price)
                subtotal += total
                console.log(`${Item.QTY}\t\t${Item.Price}\t\t${total}\t\t${Item.Item}`)
            }
            
            console.log(`\n\t\tSubtotal:\t${subtotal}`)

            salesTax += (0.06 * subtotal)
            console.log(`\t\tSales Tax:\t${salesTax.toFixed(2)}`)

            if (subtotal < 50) {
                shipping += 10
            }
            console.log(`\t\tShipping:\t${shipping.toFixed(2)}`)

            grandTotal = parseFloat(subtotal) + parseFloat(salesTax) + parseFloat(shipping)
            console.log(`\t\tGrand Total:\t${grandTotal.toFixed(2)}`)
            console.log(`-------------------------------------------------------------------------------------`)
        });
    });
