const csv = require("csv-parser");
const fs = require("fs");

const orders = [];

fs.createReadStream("./data.csv")
    .pipe(csv())
    .on("data", (data) => {
        // If orders is empty or the order names are different, make a new order
        if (orders.length == 0 || orders[orders.length - 1].name != data.name) {
            orders.push({
                name: data.name,
                address: data.address,
                items: []
            });
        }
        // Append item to items list of the last order
        orders[orders.length - 1].items.push({
            name: data.item,
            quantity: data.quantity,
            price: data.price
        });
    })
    .on("end", () => {
        // Index for orders
        let index = 0
        for (const order of orders) {
            index++;
            let orderSubtotal = 0;
            // Log name and address. Prepare for item logging
            console.log(`Name\t\t\t${order.name}`)
            console.log(`Address\t\t\t${order.address}`)
            console.log(`Item\t\t\tQTY\t\t\tPrice\t\tTotal`)
            // Log item name, qty, price, and total. Add to subtotal
            for (const item of order.items) {
                const itemTotal = parseInt(item.quantity) * parseFloat(item.price.replace("$", ""));
                orderSubtotal += itemTotal;
                console.log(`${item.name}\t${item.name.length > 15 ? "" : "\t"}${item.quantity}\t\t\t${item.price}\t\t$${itemTotal.toFixed(2)}`);
            }
            // Log subtotal, calculate and log sales tax, shipping fee, and grand total
            console.log(`\t\t\t\t\t\tSubtotal\t$${orderSubtotal.toFixed(2)}`);
            const salesTax = Math.ceil(orderSubtotal * 0.06 * 100) / 100;
            console.log(`\t\t\t\t\t\tSales Tax\t$${salesTax.toFixed(2)}`);
            const shipping = orderSubtotal > 50 ? 0 : 10;
            console.log(`\t\t\t\t\t\tShipping \t$${shipping.toFixed(2)}`);
            const grandTotal = orderSubtotal + salesTax + shipping;
            console.log(`\t\t\t\t\t\tGrand Total\t$${grandTotal.toFixed(2)}`);
            // Split orders for visual clarity, except the last order
            console.log(orders.length == index ? "" : "--------------------------------------------------------------------------------")
        }
    })
