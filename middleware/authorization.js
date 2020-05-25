const API_KEY = '2abbf7c3-245b-404f-9473-ade729ed4653';

function authorization(req, res, next) {
    console.log("Inside the middleware.");

    let bearer = req.headers.authorization;
    let header = req.headers['book-api-key'];
    let param = req.query.apiKey;

    console.log(bearer);
    console.log(header);
    console.log(param);

    if (bearer == `Bearer ${API_KEY}`) {
        next();
        return
    } else if (header == API_KEY) {
        next();
        return
    } else if (param == API_KEY) {
        next();
        return;
    }
    res.statusMesagge = "Invalid authorization";
    return res.status(401).end();
}

module.exports = authorization;