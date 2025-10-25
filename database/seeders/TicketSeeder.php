<?php

namespace Database\Seeders;

use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some users to create tickets
        $users = User::take(5)->get();
        $itSupportUsers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'it_support']);
        })->take(2)->get();

        if ($users->isEmpty()) {
            $this->command->info('No users found. Please run user seeder first.');
            return;
        }

        $tickets = [
            [
                'title' => 'Laptop tidak bisa menyala',
                'description' => 'Laptop Dell Inspiron 15 tidak bisa menyala sama sekali. Sudah dicoba charger yang berbeda tapi tetap tidak ada respon.',
                'priority' => 'high',
                'category' => 'hardware',
                'status' => 'open',
            ],
            [
                'title' => 'Email tidak bisa login',
                'description' => 'Tidak bisa login ke email perusahaan. Password sudah dicoba reset tapi tetap tidak bisa masuk.',
                'priority' => 'medium',
                'category' => 'email',
                'status' => 'in_progress',
            ],
            [
                'title' => 'WiFi lambat di lantai 3',
                'description' => 'Koneksi WiFi di lantai 3 sangat lambat, bahkan untuk membuka website sederhana pun loading lama.',
                'priority' => 'medium',
                'category' => 'network',
                'status' => 'resolved',
            ],
            [
                'title' => 'Software Adobe tidak bisa dibuka',
                'description' => 'Adobe Photoshop dan Illustrator tidak bisa dibuka, muncul error "Application not found".',
                'priority' => 'low',
                'category' => 'software',
                'status' => 'open',
            ],
            [
                'title' => 'Akses ke server database ditolak',
                'description' => 'Tidak bisa mengakses server database untuk backup data. Muncul error permission denied.',
                'priority' => 'urgent',
                'category' => 'access',
                'status' => 'in_progress',
            ],
            [
                'title' => 'Printer tidak bisa print',
                'description' => 'Printer HP LaserJet di ruang meeting tidak bisa print dokumen. Kertas tersangkut dan error light menyala.',
                'priority' => 'medium',
                'category' => 'hardware',
                'status' => 'resolved',
            ],
            [
                'title' => 'Microsoft Office license expired',
                'description' => 'Microsoft Office menunjukkan notifikasi bahwa license sudah expired dan perlu diperbarui.',
                'priority' => 'high',
                'category' => 'software',
                'status' => 'open',
            ],
            [
                'title' => 'VPN tidak bisa connect',
                'description' => 'Tidak bisa connect ke VPN perusahaan dari rumah. Error "Connection failed" muncul setiap kali mencoba.',
                'priority' => 'medium',
                'category' => 'network',
                'status' => 'in_progress',
            ],
        ];

        foreach ($tickets as $index => $ticketData) {
            $user = $users->random();
            $assignedUser = null;
            
            // Assign some tickets to IT support users
            if (in_array($ticketData['status'], ['in_progress', 'resolved']) && $itSupportUsers->isNotEmpty()) {
                $assignedUser = $itSupportUsers->random();
            }

            $ticket = Ticket::create([
                'title' => $ticketData['title'],
                'description' => $ticketData['description'],
                'priority' => $ticketData['priority'],
                'category' => $ticketData['category'],
                'status' => $ticketData['status'],
                'user_id' => $user->id,
                'assigned_to' => $assignedUser?->id,
                'resolved_at' => $ticketData['status'] === 'resolved' ? now()->subDays(rand(1, 7)) : null,
                'resolution' => $ticketData['status'] === 'resolved' ? 'Masalah telah diperbaiki dan diverifikasi berfungsi normal.' : null,
            ]);

            // Add some comments to tickets
            if (in_array($ticketData['status'], ['in_progress', 'resolved'])) {
                // Add comment from assigned user
                if ($assignedUser) {
                    TicketComment::create([
                        'ticket_id' => $ticket->id,
                        'user_id' => $assignedUser->id,
                        'comment' => 'Sedang menangani masalah ini. Akan segera diupdate.',
                        'is_internal' => false,
                    ]);
                }

                // Add internal comment
                if ($assignedUser) {
                    TicketComment::create([
                        'ticket_id' => $ticket->id,
                        'user_id' => $assignedUser->id,
                        'comment' => 'Internal note: Perlu koordinasi dengan vendor untuk masalah hardware.',
                        'is_internal' => true,
                    ]);
                }
            }

            // Add comment from ticket creator
            if (rand(0, 1)) {
                TicketComment::create([
                    'ticket_id' => $ticket->id,
                    'user_id' => $user->id,
                    'comment' => 'Terima kasih atas bantuannya. Masalah ini sangat mengganggu pekerjaan saya.',
                    'is_internal' => false,
                ]);
            }
        }

        $this->command->info('Sample tickets created successfully!');
    }
}
