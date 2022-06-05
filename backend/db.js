const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://dbuser:dbpassword@cluster0.whqft.mongodb.net/?retryWrites=true&w=majority', 
{useNewUrlParser: true, useUnifiedTopology: true});

const paymentSchema = new mongoose.Schema({
    id: String,
    itemId: String,
    paid: Boolean
});

const payment = mongoose.model('Payment', paymentSchema);

module.exports = {
    payment
}