<?php

namespace App\Mail;

use App\Models\Groupe;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GroupInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public $groupe;
    public $token;
    public $isExistingUser;

    /**
     * Create a new message instance.
     */
    public function __construct(Groupe $groupe, $token, $isExistingUser = false)
    {
        $this->groupe = $groupe;
        $this->token = $token;
        $this->isExistingUser = $isExistingUser;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Invitation à rejoindre le groupe : {$this->groupe->nom}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.group-invitation',
        );
    }
}
