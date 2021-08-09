document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //when submit call the function send_mail
  document.querySelector('form').addEventListener("submit", send_mail);

  // By default, load the inbox
  load_mailbox('inbox');
});



function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector("#email-content").style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}



function send_mail(event) {
  /*
  This function should send the mail
  composed from user but only when submit
  */
  event.preventDefault();

  //campos necesarios para que el mensaje sea valido
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;


  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })

    .then(response => response.json())
    .then(result => {
      //successful
      alert(`Successful mailing for ${recipients}!`);
      load_mailbox('sent', result);
    });
}



function load_mailbox(mailbox){
  /*
    this function shoul load all messages that
    were sent or received for this particular user in all 
    "folders" like "Inbox" "Sent" 
  
  */

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#email-content").style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  //redirect from specific mail box
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      //console.log(emails);

      emails.forEach(email => {

        const htmlstring = `<div><h6><strong>From: </strong>${email['sender']}</h6>
                            <h6><strong>To: </strong>${email['recipients']}</h6>
                            <h6><strong>Subject: </strong>${email['subject']}</h6> 
                            <h6><strong>Date: </strong>${email['timestamp']}</h6></div>
                          <br><br>`;

                        
        const mails = document.createElement('div');  
        //console.log(email.id);
        mails.innerHTML = htmlstring;

    
        //add to DOM
        document.querySelector('#emails-view').append(mails);
        mails.className = 'mail';

        //when click in a email display all info about it (view_email)
        mails.addEventListener('click', function() {
          view_email(email.id);
        });

     
        //alert(`read,${email.read}`);
        if (`${email.read}` == false){
          const background = document.querySelector('.mail');
          background.style.backgroundColor = "rgba(21, 226, 235 0.5)";
        }
      });

    })
};


function view_email(id){
  /*
  This function shoul return a complete view (sender, recipients, subject, timestamp and body) when
  the user clicks the email, take the id and display on #email-content 
  */
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#email-content").style.display = 'block';
  

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    
    var id = `${email.id}`;
    document.querySelector('#email-content').innerHTML = "";
    const element = document.createElement('div');
    const email_content = `
    <div>
      <p><strong>Date: </strong>${email['timestamp']}</p>
      <p><strong> ${email['subject']}</strong></p>
      <p><strong>From: </strong> ${email['sender']}</p> 
      <p><strong> To: </strong>${email['recipients']}</p>
      <strong>Body: </strong>${email['body']}
    </div>`;

    element.innerHTML = email_content;
    document.querySelector('#email-content').append(element);

    
    //when click the button for archive call the function but only for inbox
    const archive_ = document.createElement('button');
    archive_.innerHTML = `<value>Archive</value>`;
    archive_.addEventListener('click', function(){
      archive(id, read)
    });
    document.querySelector('#email-content').append(archive_);

    
    const read_ = document.createElement('button');
    read_.innerHTML = `<value>Read!</value>`; 
    read_.addEventListener('click', function() {
      fetch(`/emails/${id}`,{
        method: 'PUT',
        body: JSON.stringify({
          read:true
        })
      })
      //alert(`this messages is read ${id}`)
    });
    document.querySelector('#email-content').append(read_);
    //load_mailbox('inbox')

    const reply = document.createElement('button');
    reply.innerHTML = `<value>Reply</value>`;
    reply.addEventListener('click', function() {
     compose_email();

      // //autollenar los campos segun reply
      document.querySelector('#compose-recipients').value = email.sender;

      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;

      let body = `On ${email.timestamp}, ${email.sender}, wrote ${email.body}`; 
      document.querySelector('#compose-body').value = body;

    })

  })
};


function archive(id, archived) {

  /* This function allow users to archive and un archive mails (ONLY WORKS WITH I N B O X).
    Once an email has been archived or unarchived, load the user’s inbox.
    TRY TO USE: PUT request to /emails/<email_id>  */ 

  const ar_id = `${id}`
  const ar_archive =`${archived.replace(/^\w/, (c) => c.toUpperCase())}`
  //alert(`id: ${ar_id}, archivado :${ar_archive}`);


  fetch(`/emails/${ar_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  load_mailbox('inbox');
};

