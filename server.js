const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// --- PODEŠAVANJA ---
const MOJA_MEJL_ADRESA = "websitemaker1220@gmail.com";
const SMTP_LOZINKA = "txyv tzcm xtax zyvz";
// --------------------

const PRODUCTS_FILE = './products.json';

// Inicijalizacija fajla za proizvode ako ne postoji
if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([]));
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: MOJA_MEJL_ADRESA,
        pass: SMTP_LOZINKA
    }
});

// Endpoint za slanje porudžbine na mejl
app.post('/orders', (req, res) => {
    const order = req.body;
    const itemsHtml = order.items.map(item =>
        `<li>${item.name} (x${item.quantity}) - ${item.price}€</li>`
    ).join('');

    const mailOptions = {
        from: MOJA_MEJL_ADRESA,
        to: MOJA_MEJL_ADRESA,
        subject: `Nova porudžbina od: ${order.name}`,
        html: `
            <h2>Nova porudžbina!</h2>
            <p><strong>Ime:</strong> ${order.name}</p>
            <p><strong>Adresa:</strong> ${order.address}</p>
            <p><strong>Telefon:</strong> ${order.phone}</p>
            <h3>Proizvodi:</h3>
            <ul>${itemsHtml}</ul>
            <p><strong>Ukupno za naplatu:</strong> ${order.totalAmount.toFixed(2)} €</p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send("Greška pri slanju mejla.");
        } else {
            res.status(200).send("Porudžbina uspešna!");
        }
    });
});

// Endpoint za dobijanje svih admin proizvoda
app.get('/admin-products', (req, res) => {
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));
    res.json(products);
});

// Endpoint za dodavanje novog proizvoda od strane admina
app.post('/admin-products', (req, res) => {
    const newProduct = req.body;
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));

    // Generisanje ID-a
    newProduct.id = Date.now();

    products.unshift(newProduct);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products));
    res.status(201).json(newProduct);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server radi na portu ${PORT}`);
});
