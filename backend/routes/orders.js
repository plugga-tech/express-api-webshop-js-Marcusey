var express = require('express');
var router = express.Router();
var ObjectId = require("mongodb").ObjectId;

/* Add order */
router.post('/add', async (req, res) => {
    try {
        const order = {
            user: req.body.user,
            products: []
        };

        if (!order.user) {
            return res.status(400).json({ message: "You have to login to place an order" });
        }

        //Uppdatera lagret och fyll på ordern
        for (const orderProduct of req.body.products) {
            const productId = new ObjectId(orderProduct.productId);
            const quantity = orderProduct.quantity;

            //Uppdatera produktens lager
            await req.app.locals.db.collection("products").updateOne(
                { _id: productId },
                { $inc: { lager: -quantity } }
            );

            //Lägg till produkten i ordern
            order.products.push({ productId, quantity });
        }

        //Sparar ordern i databasen
        const result = await req.app.locals.db.collection("orders").insertOne(order);

        //Tar bort _id från objektet innan det skickas tillbaka
        delete order._id;

        //Skicka tillbaka den skapade ordern som svar
        res.status(201).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

/* Get all orders */
router.get('/all', async (req, res) => {
    try {
        const key = req.query.apikey;

        if (key !== process.env.GET_ALL_ORDERS_KEY) {
            return res.status(401).json({ message: "You need a key to see all orders!" });
        }

        //Hämtar alla ordrar från databasen
        const orders = await req.app.locals.db.collection("orders").find().toArray();

        //Ersätter `_id` med `id`
        const processedOrders = orders.map(order => {
            return {
                ...order,
                id: order._id,
                _id: undefined
            };
        });

        //Skickar tillbaka färdiga ordrar
        res.json(processedOrders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


/* Get orders for a specific user */
router.post('/user', async (req, res) => {
    try {
        const { user, token } = req.body;

        if (!token) {
            return res.status(401).json({ message: "You need a key to see this." });
        }

        if (token !== process.env.ADD_PRODUCT_TOKEN) {
            return res.status(401).json({ message: "You need the right key to see this." });
        }

        //Hämtar för specifik användare
        const orders = await req.app.locals.db.collection("orders").find({ user }).toArray();

        //Ersätt `_id` med `id`
        const processedOrders = orders.map(order => ({
            ...order,
            id: order._id,
            _id: undefined
        }));

        //Skickar tillbaka ordrarna
        res.json(processedOrders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;