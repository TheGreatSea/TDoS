exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/summariesdb';
//exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb+srv://admin:12345@cluster0-65zvs.mongodb.net/summariesdb?retryWrites=true&w=majority';

exports.TOKEN = process.env.API_TOKEN || '2abbf7c3-245b-404f-9473-ade729ed4653';
exports.PORT = process.env.PORT || '27017';

exports.SECRET_TOKEN = process.env.SECRET_TOKEN || 'SantaClausIsTheParents';