-- ============================================================================
-- SEED DATA — 2-WEEK BEGINNER PROGRAM
-- Run after schema.sql. Safe to re-run (clears existing workouts first).
-- ============================================================================

delete from public.workouts;

insert into public.workouts (day, title, description, image_url, video_url, order_index) values
-- ---------------- WEEK 1 ----------------
('week1-day1', 'Push-ups', '3 sets x 10 reps. Keep your core tight and lower your chest to just above the floor.', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', null, 1),
('week1-day1', 'Bodyweight Squats', '3 sets x 15 reps. Feet shoulder-width apart, push your hips back as you lower.', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800', null, 2),
('week1-day1', 'Plank Hold', '3 sets x 30 seconds. Keep your body in a straight line from head to heels.', 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=800', null, 3),

('week1-day2', 'Walking Lunges', '3 sets x 12 reps per leg. Step forward and lower until both knees are at 90 degrees.', 'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800', null, 1),
('week1-day2', 'Dumbbell Rows', '3 sets x 10 reps per arm. Hinge at the hips, pull the weight to your ribcage.', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800', null, 2),
('week1-day2', 'Glute Bridges', '3 sets x 15 reps. Squeeze your glutes at the top of each rep.', 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=800', null, 3),

('week1-day3', 'Active Recovery Walk', '20-30 minutes at an easy pace. Focus on breathing and posture.', 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800', null, 1),
('week1-day3', 'Mobility Stretching', '10 minutes covering hips, shoulders, and hamstrings.', 'https://images.unsplash.com/photo-1599447292180-45fd84092ef4?w=800', null, 2),

('week1-day4', 'Incline Push-ups', '3 sets x 12 reps using a bench or sturdy table for an easier angle.', 'https://images.unsplash.com/photo-1598266663439-2056e6900339?w=800', null, 1),
('week1-day4', 'Goblet Squats', '3 sets x 12 reps holding a dumbbell or kettlebell at chest height.', 'https://images.unsplash.com/photo-1567598508481-65985588e295?w=800', null, 2),
('week1-day4', 'Side Plank', '2 sets x 20 seconds per side. Stack your feet and lift your hips.', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800', null, 3),

('week1-day5', 'Step-ups', '3 sets x 10 reps per leg using a sturdy box or stair.', 'https://images.unsplash.com/photo-1434596922112-19c563067271?w=800', null, 1),
('week1-day5', 'Resistance Band Rows', '3 sets x 15 reps. Squeeze your shoulder blades together.', 'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=800', null, 2),
('week1-day5', 'Dead Bug', '3 sets x 10 reps per side. Keep your lower back pressed to the floor.', 'https://images.unsplash.com/photo-1573384495167-19844ee35733?w=800', null, 3),

('week1-day6', 'Full Body Circuit', 'Repeat 3 rounds: 10 squats, 10 push-ups, 10 rows, 30s plank.', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', null, 1),

('week1-day7', 'Rest Day', 'Full rest. Light stretching optional. Focus on hydration and sleep.', 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=800', null, 1),

-- ---------------- WEEK 2 ----------------
('week2-day1', 'Push-ups', '4 sets x 12 reps. Slow the lowering phase to 3 seconds.', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', null, 1),
('week2-day1', 'Jump Squats', '3 sets x 10 reps. Land softly with bent knees.', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800', null, 2),
('week2-day1', 'Plank Hold', '3 sets x 40 seconds.', 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=800', null, 3),

('week2-day2', 'Bulgarian Split Squats', '3 sets x 10 reps per leg using a bench for your rear foot.', 'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800', null, 1),
('week2-day2', 'Dumbbell Rows', '4 sets x 12 reps per arm.', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800', null, 2),
('week2-day2', 'Glute Bridge March', '3 sets x 10 reps per leg, holding the bridge position.', 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=800', null, 3),

('week2-day3', 'Active Recovery Walk', '30 minutes at a brisk pace.', 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800', null, 1),
('week2-day3', 'Mobility Stretching', '15 minutes, hold each stretch for 30 seconds.', 'https://images.unsplash.com/photo-1599447292180-45fd84092ef4?w=800', null, 2),

('week2-day4', 'Diamond Push-ups', '3 sets x 8 reps with hands close together to target triceps.', 'https://images.unsplash.com/photo-1598266663439-2056e6900339?w=800', null, 1),
('week2-day4', 'Front Squats', '4 sets x 10 reps holding weight at shoulder height.', 'https://images.unsplash.com/photo-1567598508481-65985588e295?w=800', null, 2),
('week2-day4', 'Side Plank with Reach', '3 sets x 12 reps per side, threading arm under body.', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800', null, 3),

('week2-day5', 'Box Step-ups with Knee Drive', '3 sets x 10 reps per leg.', 'https://images.unsplash.com/photo-1434596922112-19c563067271?w=800', null, 1),
('week2-day5', 'Resistance Band Pull-Aparts', '3 sets x 15 reps for shoulder stability.', 'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=800', null, 2),
('week2-day5', 'Hollow Body Hold', '3 sets x 20 seconds for deep core strength.', 'https://images.unsplash.com/photo-1573384495167-19844ee35733?w=800', null, 3),

('week2-day6', 'Full Body Finisher', 'Repeat 4 rounds: 12 squats, 12 push-ups, 12 rows, 40s plank.', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', null, 1),

('week2-day7', 'Rest Day', 'Full rest. Reflect on your two weeks and plan your next block.', 'https://images.unsplash.com/photo-1518644730709-0835105d9daa?w=800', null, 1);
