const csv = require('csv-parser')
const fs = require('fs')
const orders = [];
fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (data) => {
        if (orders.length == 0 || orders[orders.length - 1].name != data.name) {
            orders.push({
                name: data.name,
                address: data.address,
                items: []
            })
        }
        orders[orders.length - 1].items.push({
            item: data.item,
            qty: data.qty,
            price: data.price
        })
    })
    .on('end', () => {
        for (const order of orders) {
            let subtotal = 0
            let salesTax = 0
            let grandTotal = 0
            let shipping = 0
            console.log('Name: ' + order.name);
            console.log('Address: ' + order.address);
            console.log('QTY\tPrice\t\tTotal\tItem')

            for (const item of order.items) {
                let total = item.qty * item.price
                subtotal += total;
                console.log(`${item.qty}\t${item.price}\t\t${total}\t${item.item}`)
            }
            console.log('\tSubtotal:\t' + subtotal.toFixed(2));
            salesTax = Number((subtotal * 0.06).toFixed(2));
            console.log('\tSales Tax:\t' + salesTax);

            if (subtotal <= 50) {
                shipping = 10
            }
            console.log('\tShipping:\t' + shipping.toFixed(2));
            grandTotal += subtotal + salesTax + shipping
            console.log('\tGrand Total:\t' +grandTotal)
        } 

    });

