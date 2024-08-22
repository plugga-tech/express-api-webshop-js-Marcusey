var express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();

/* GET home page. */
router.get('/', async (req, res, next) => {
    try {
        const results = await req.app.locals.db.collection('products').find().toArray();
        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/* GET ID */
router.get('/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await req.app.locals.db.collection('products').findOne({ _id: new ObjectId(productId) });

        if (!product) {
            return res.status(404).json({ error: 'Produkten kan inte hittas' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/* Create product */
router.post('/add', async (req, res) => {
    try {
        const product = req.body;
        const result = await req.app.locals.db.collection('products').insertOne(product);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not create new product' });
    }
});

module.exports = router;