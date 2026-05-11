const csv = require('csv-parser')
const fs = require('fs')
const results = [];

function tableHelper(str, maxLen = 32) {
    const numSpaces = Math.abs(maxLen - str.length) - 3;
    let spaces = '';
    for(i=0;i<numSpaces;i++) spaces += ' ';
    return str.substring(0, maxLen) + '...' + spaces;
}

fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {

        const orders = [];

        for (i in results){

            const entry = results[i];

            if (entry.customer && entry.address) {
                orders.push({
                    customer: entry.customer,
                    address: entry.address,
                    items: []
                });
            }

            const lastOrder = orders[orders.length - 1];

            const price = Number(entry.price);
            const quantity = parseInt(entry.quantity)
            
            lastOrder.items.push({
                name: entry.item,
                quantity,
                price,
            });

        }

        for (i in orders) {
            const order = orders[i];

            let subtotal = 0;

            console.log('-------------------------------------------------------------------------------------');
            console.log('Name\t'+order.customer);
            console.log('Address\t'+order.address + '\n');
            console.log('Item\t\t\t\t\t\tQTY\t\tPrice\t\tTotal');
            for (item of order.items) {
                const total = item.price * item.quantity;
                subtotal += total;
                console.log(tableHelper(item.name)+'\t\t'+item.quantity+'\t\t'+item.price+'\t\t'+total)
            }
            console.log('\n');
            const tax = subtotal * 0.06;
            const shipping = (subtotal > 50) ? 0.00 : 10.00;
            const grandTotal = subtotal+tax+shipping;
            console.log('Subtotal\t'+subtotal);
            console.log('Sales Tax\t'+Number(tax.toFixed(2)));
            console.log('Shipping\t'+shipping+'.00');
            console.log('Grand Total\t'+Number(grandTotal.toFixed(2)));
            console.log('-------------------------------------------------------------------------------------');
        }
    });