const csv = require('csv-parser')
const fs = require('fs')

const orders = [];
fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (data) => {
        if (orders.length == 0 || data.Name !== orders[orders.length - 1].Name) {
            orders.push({
                Name: data.Name,
                Address: data.Address,
                Items: []
            })
        }
        orders[orders.length - 1].Items.push({
            Item: data.Item,
            QTY: data.QTY,
            Price: data.Price
        })
    })
    .on('end', () => {
        orders.forEach(order => {
            let subtotal = 0
            let salesTax = 0
            let shipping = 0
            let grandTotal = 0

            console.log(`NAME:\t\t${order.Name}\tADDRESS:\t${order.Address}`);
            console.log(`QTY:\t\tPRICE:\t\tTOTAL:\t\tITEM:`)
            for (Item of order.Items) {
                let total = Item.QTY * parseFloat(Item.Price)
                subtotal += total
                salesTax += total * 0.06
                grandTotal += total + salesTax + shipping
                console.log(`${Item.QTY}\t\t${Item.Price}\t\t${total}\t\t${Item.Item}`)
            }
            console.log(`\t\tSUBTOTAL:\t${subtotal.toFixed(2)}`)
            console.log(`\t\tSALES TAX:\t${salesTax.toFixed(2)}`)
            if (subtotal < 50) {
                shipping += 10
            }
            console.log(`\t\tSHIPPING:\t${shipping.toFixed(2)}`)
            console.log(`\t\tGRAND TOTAL:\t${grandTotal.toFixed(2)}`)
        });
    });
