<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\MedicamentRequest;

class RequestUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $medRequest;

    /**
     * Create a new event instance.
     */
    public function __construct(MedicamentRequest $medRequest)
    {
        $this->medRequest = $medRequest->load(['medicament', 'requester:id,name', 'owner:id,name']);
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'request.updated';
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('requests.' . $this->medRequest->id),
            new PrivateChannel('users.' . $this->medRequest->requester_id),
            new PrivateChannel('users.' . $this->medRequest->owner_id),
        ];
    }
}
