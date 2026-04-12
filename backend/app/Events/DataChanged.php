<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DataChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $type;
    public $target_id;
    public $is_user_channel;

    /**
     * Create a new event instance.
     * 
     * @param string $type - Type of change (inventory_updated, group_updated, etc)
     * @param int $targetId - Profil ID or User ID
     * @param bool $isUserChannel - True if targetId refers to a User
     */
    public function __construct(string $type, int $targetId, bool $isUserChannel = false)
    {
        $this->type = $type;
        $this->target_id = $targetId;
        $this->is_user_channel = $isUserChannel;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        if ($this->is_user_channel) {
            return [new PrivateChannel("App.Models.User.{$this->target_id}")];
        }
        
        return [new PrivateChannel("App.Models.Profil.{$this->target_id}")];
    }
}
