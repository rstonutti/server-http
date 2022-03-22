const http = require('http'),
    nodemailer =require('nodemailer'),
    index = require('fs').readFileSync('index.html'),
    form = require('fs').readFileSync('form.html'),
    urls = require('url'),
    fs = require('fs'),
    hostname = '127.0.0.1',
    port = 3000;

const server = http.createServer((req, res) => {
    url = urls.parse(req.url).pathname;
    router(routes, url, res, req);
});

server.listen(port, hostname, () => {
    console.log(`El servidor se está ejecutando en http://${hostname}:${port}/`);
});

function router(routes, url, res, req) {
    if (typeof routes[url] === 'function') {
        return routes[url](res, req);
    };
};

const routes = {};
routes['/'] = home;
routes['/crear'] = crear;

function home(res) {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    })
    res.end(index);
};

function crear(res, req) {
    let body = [];
    if (req.method == 'GET') {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        })
        res.end(form);
    }
    if (req.method == 'POST') {
        req
            .on('data', chunk => {
                body.push(chunk)
            })
            .on('end', function () {
                body = Buffer.concat(body).toString().split('=').join(',').split('&').join(',').split(',');
                
                const [,titulo,,cadena] = body;
                
                let mensaje = cadena.replace(/[+]/g, " ");
                
                let templateString = `<p>El archivo <b>${titulo}.txt</b> fue enviado</p>`;
                
                fs.writeFileSync(`${titulo}.txt`, mensaje, error => {
                    if(error) throw error;
                    console.log('Archivo creado');
                });

                let transporter = nodemailer.createTransport({
                    host: "smtp.ethereal.email",
                    port: 587,
                    secure: false,
                    auth: {
                        user: "br7zgqdwdxrre2dw@ethereal.email",
                        pass: "DSsNwJjwcqtqCbY8CH"
                    }
                });

                let mailOption = {
                    from: 'Remitente',
                    to: "rstonutti@gmail.com",
                    subject: "Enviado desde Node Mailer",
                    text: "Hola",
                    attachments: [{
                        path: `${titulo}.txt`
                    }]
                };

                transporter.sendMail(mailOption, (error, info) => {
                    if(error){
                        console.log(error);
                    } else {
                        console.log('Enviado')
                    };
                });

                res.end(templateString);
            });
    };
};