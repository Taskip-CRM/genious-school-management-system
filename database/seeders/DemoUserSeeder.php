<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\School;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create demo school
        $school = School::firstOrCreate(
            ['slug' => 'greenfield-academy'],
            [
                'name'     => 'Greenfield Academy',
                'email'    => 'info@greenfield.edu',
                'phone'    => '+8801700000000',
                'address'  => '123 School Road, Dhaka',
                'city'     => 'Dhaka',
                'country'  => 'BD',
                'timezone' => 'Asia/Dhaka',
                'currency' => 'BDT',
                'language' => 'en',
                'status'   => 'active',
            ]
        );

        // Create current academic year
        AcademicYear::firstOrCreate(
            ['school_id' => $school->id, 'name' => '2025-2026'],
            [
                'start_date' => '2025-01-01',
                'end_date'   => '2025-12-31',
                'is_current' => true,
            ]
        );

        $demoUsers = [
            [
                'name'  => 'School Admin',
                'email' => 'school-admin@genius-sms.test',
                'role'  => 'school-admin',
            ],
            [
                'name'  => 'Principal',
                'email' => 'principal@genius-sms.test',
                'role'  => 'principal',
            ],
            [
                'name'  => 'Teacher Demo',
                'email' => 'teacher@genius-sms.test',
                'role'  => 'teacher',
            ],
            [
                'name'  => 'Accountant Demo',
                'email' => 'accountant@genius-sms.test',
                'role'  => 'accountant',
            ],
            [
                'name'  => 'Librarian Demo',
                'email' => 'librarian@genius-sms.test',
                'role'  => 'librarian',
            ],
            [
                'name'  => 'Student Demo',
                'email' => 'student@genius-sms.test',
                'role'  => 'student',
            ],
            [
                'name'  => 'Parent Demo',
                'email' => 'parent@genius-sms.test',
                'role'  => 'parent',
            ],
        ];

        foreach ($demoUsers as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'      => $data['name'],
                    'school_id' => $school->id,
                    'password'  => bcrypt('password'),
                    'status'    => 'active',
                ]
            );
            $user->syncRoles([$data['role']]);
        }

        $this->command->info('Demo school and users seeded.');
    }
}
