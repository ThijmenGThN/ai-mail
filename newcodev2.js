const Imap = require('imap');
const simpleParser = require('mailparser').simpleParser;
const { Set } = require('immutable');

const imap = new Imap({
  user: 'your-email@example.com',
  password: 'your-email-password',
  host: 'imap.example.com',
  port: 993,
  tls: true
});

const readEmails = new Set();

const checkEmails = function() {
  imap.once('ready', function() {
    imap.openBox('INBOX', true, function(err, box) {
      if (err) throw err;
      var f = imap.seq.fetch('1:3', {
        bodies: '',
        struct: true
      });
      f.on('message', function(msg, seqno) {
        console.log('Message #%d', seqno);
        var prefix = '(#' + seqno + ') ';
        msg.on('body', function(stream, info) {
          simpleParser(stream, function(err, parsed) {
            console.log(prefix + 'Subject:', parsed.subject);
            console.log(prefix + 'From:', parsed.from.text);
            console.log(prefix + 'Date:', parsed.date);
            console.log(prefix + 'Text body:', parsed.text);

            // Add the email to the set of read emails
            readEmails.add(parsed.subject);
          });
        });
        msg.once('attributes', function(attrs) {
          console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
        });
        msg.once('end', function() {
          console.log(prefix + 'Finished');
        });
      });
      f.once('error', function(err) {
        console.log('Fetch error: ' + err);
      });
      f.once('end', function() {
        console.log('Done fetching all messages!');
        imap.end();
      });
    });
  });

  imap.once('error', function(err) {
    console.log(err);
  });

  imap.once('end', function() {
    console.log('Connection ended');
  });

  imap.connect();
};

// Repeat the checkEmails function every 5 seconds
setInterval(checkEmails, 5000);
