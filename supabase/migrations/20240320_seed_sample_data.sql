-- Seed tags first
INSERT INTO tags (name) VALUES
    ('cooking'),
    ('recipe'),
    ('travel'),
    ('work'),
    ('shopping'),
    ('home'),
    ('fitness'),
    ('project'),
    ('daily'),
    ('weekend'),
    ('food'),
    ('vacation'),
    ('maintenance'),
    ('personal'),
    ('study'),
    ('health')
ON CONFLICT (name) DO NOTHING;

-- Function to create a todo list with items and tags
CREATE OR REPLACE FUNCTION create_sample_todolist(
    p_title TEXT,
    p_items JSONB,
    p_tag_names TEXT[]
) RETURNS UUID AS $$
DECLARE
    v_todolist_id UUID;
    v_tag_id UUID;
    v_item RECORD;
    v_tag_name TEXT;
    v_expires_at TIMESTAMP WITH TIME ZONE;
    v_edit_token TEXT;
BEGIN
    -- Set expiration to 7 days from now
    v_expires_at := NOW() + INTERVAL '7 days';
    -- Generate edit token
    v_edit_token := encode(gen_random_bytes(9), 'base64');
    
    -- Create todo list
    INSERT INTO todo_lists (title, expires_at, edit_token)
    VALUES (p_title, v_expires_at, v_edit_token)
    RETURNING id INTO v_todolist_id;
    
    -- Create items
    FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO todo_items (todo_list_id, content, completed, "order", priority)
        VALUES (
            v_todolist_id,
            v_item.value->>'content',
            COALESCE((v_item.value->>'completed')::boolean, false),
            COALESCE((v_item.value->>'order')::integer, 0),
            (COALESCE(v_item.value->>'priority', 'medium'))::priority_level
        );
    END LOOP;
    
    -- Add tags
    FOREACH v_tag_name IN ARRAY p_tag_names
    LOOP
        SELECT id INTO v_tag_id FROM tags WHERE name = v_tag_name;
        IF v_tag_id IS NOT NULL THEN
            INSERT INTO todolist_tags (todolist_id, tag_id)
            VALUES (v_todolist_id, v_tag_id);
        END IF;
    END LOOP;
    
    RETURN v_todolist_id;
END;
$$ LANGUAGE plpgsql;

-- Seed sample todo lists
DO $$ 
DECLARE
    v_todolist_id UUID;
BEGIN
    -- 1. Italian Dinner Party Recipe
    PERFORM create_sample_todolist(
        'Italian Dinner Party Menu',
        '[
            {"content": "Make fresh pasta dough (mix 2 cups flour, 3 eggs, pinch of salt) and let rest for 30 minutes", "order": 1, "priority": "high"},
            {"content": "Prepare authentic tomato sauce with San Marzano tomatoes, fresh basil, and garlic - simmer for 2 hours", "order": 2, "priority": "high"},
            {"content": "Make classic tiramisu with mascarpone, ladyfingers, and freshly brewed espresso - prepare 4 hours ahead", "order": 3, "priority": "medium"},
            {"content": "Prepare garlic bread using fresh Italian bread, roasted garlic, and high-quality olive oil", "order": 4, "priority": "low"},
            {"content": "Buy Italian wine (recommended: Chianti Classico or Barolo) from specialty wine shop", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['cooking', 'recipe', 'food']
    );

    -- 2. Tokyo Travel Itinerary
    PERFORM create_sample_todolist(
        'Tokyo 5-Day Trip Plan',
        '[
            {"content": "Visit Tsukiji Fish Market at 5 AM for tuna auction, followed by sushi breakfast at Building 6", "order": 1, "priority": "high"},
            {"content": "Explore Akihabara - visit Super Potato retro games, Yodobashi Camera, and anime shops on main street", "order": 2, "priority": "medium"},
            {"content": "Day trip to Mt. Fuji - take 7:30 AM bus from Shinjuku Station to 5th station, hike to observation point", "order": 3, "priority": "high"},
            {"content": "Shopping in Shibuya - visit Shibuya 109, explore Center Gai, and watch sunset at Shibuya Sky", "order": 4, "priority": "medium"},
            {"content": "Visit Senso-ji Temple early morning (7 AM), explore Nakamise shopping street, then Asakusa area", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['travel', 'vacation']
    );

    -- 3. Weekly Work Tasks
    PERFORM create_sample_todolist(
        'Weekly Sprint Tasks',
        '[
            {"content": "Review frontend PR #234 - focus on new authentication implementation and component optimization", "order": 1, "priority": "high"},
            {"content": "Update API documentation for new endpoints (/users/profile and /users/settings) with examples", "order": 2, "priority": "medium"},
            {"content": "Prepare sprint review presentation - include velocity metrics and feature demos for stakeholders", "order": 3, "priority": "high"},
            {"content": "Debug production issue with user session timeout - check Redis cache and JWT token expiration", "order": 4, "priority": "high"},
            {"content": "Write unit tests for new payment processing module - ensure 90% coverage with Jest", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['work', 'project']
    );

    -- 4. Monthly Grocery Shopping
    PERFORM create_sample_todolist(
        'Monthly Grocery List',
        '[
            {"content": "Buy organic vegetables (spinach, carrots, tomatoes) and seasonal fruits from farmers market", "order": 1, "priority": "high"},
            {"content": "Purchase grass-fed beef, wild-caught salmon, and free-range chicken from butcher section", "order": 2, "priority": "high"},
            {"content": "Get dairy products: Greek yogurt, organic milk, aged cheddar, and grass-fed butter", "order": 3, "priority": "medium"},
            {"content": "Stock up on eco-friendly cleaning supplies: laundry detergent, dish soap, and surface cleaners", "order": 4, "priority": "low"},
            {"content": "Buy healthy snacks (nuts, dried fruits) and beverages (green tea, sparkling water)", "order": 5, "priority": "low"}
        ]'::jsonb,
        ARRAY['shopping', 'home']
    );

    -- 5. Home Maintenance
    PERFORM create_sample_todolist(
        'Spring Home Maintenance',
        '[
            {"content": "Clean gutters thoroughly - remove debris, check downspouts, and install gutter guards", "order": 1, "priority": "high"},
            {"content": "Test all smoke detectors, replace batteries, and verify CO2 detector functionality", "order": 2, "priority": "high"},
            {"content": "Schedule HVAC maintenance - clean filters, check refrigerant levels, test cooling system", "order": 3, "priority": "medium"},
            {"content": "Pressure wash deck using 2500 PSI washer - treat wood areas and inspect for repairs", "order": 4, "priority": "low"},
            {"content": "Clean all windows inside and out, repair screens, and check window seals", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['home', 'maintenance']
    );

    -- 6. Fitness Goals
    PERFORM create_sample_todolist(
        'Monthly Fitness Goals',
        '[
            {"content": "Run 5km 3x per week - follow Couch to 5K program, track with Strava app", "order": 1, "priority": "high"},
            {"content": "Strength training Mon/Wed/Fri - focus on compound exercises, progressive overload", "order": 2, "priority": "high"},
            {"content": "Yoga sessions Tue/Thu - 45-minute flow class, focus on flexibility and breathing", "order": 3, "priority": "medium"},
            {"content": "Track daily calories using MyFitnessPal - aim for 2000 calories with 40% protein", "order": 4, "priority": "medium"},
            {"content": "Take weekly progress photos and measurements - update fitness journal", "order": 5, "priority": "low"}
        ]'::jsonb,
        ARRAY['fitness', 'personal']
    );

    -- 7. Thai Cooking Class Prep
    PERFORM create_sample_todolist(
        'Thai Cooking Class Preparation',
        '[
            {"content": "Buy Mae Ploy red and green curry paste from Asian market - check expiration dates", "order": 1, "priority": "high"},
            {"content": "Get fresh lemongrass, kaffir lime leaves, and galangal from specialty produce store", "order": 2, "priority": "high"},
            {"content": "Prepare homemade coconut milk or buy Chaokoh brand - need 4 cans", "order": 3, "priority": "medium"},
            {"content": "Purchase thin and wide rice noodles for Pad Thai and Pad See Ew", "order": 4, "priority": "medium"},
            {"content": "Buy premium fish sauce (Red Boat brand) and oyster sauce for stir-fries", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['cooking', 'shopping', 'food']
    );

    -- 8. Weekend DIY Project
    PERFORM create_sample_todolist(
        'Build a Garden Bench',
        '[
            {"content": "Purchase pressure-treated lumber (2x4s, 2x6s), galvanized screws, and weather-resistant stain", "order": 1, "priority": "high"},
            {"content": "Cut wood according to plans - 4ft seat length with 18-inch height", "order": 2, "priority": "high"},
            {"content": "Sand all pieces with 120-grit, then 220-grit sandpaper for smooth finish", "order": 3, "priority": "medium"},
            {"content": "Assemble frame using pocket holes and waterproof wood glue for stability", "order": 4, "priority": "high"},
            {"content": "Apply 2 coats of exterior stain and sealer - wait 24 hours between coats", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['home', 'weekend', 'project']
    );

    -- 9. Study Plan
    PERFORM create_sample_todolist(
        'React Advanced Concepts Study',
        '[
            {"content": "Master React Hooks - useEffect, useCallback, useMemo with practical examples", "order": 1, "priority": "high"},
            {"content": "Build small app using Context API for global state management", "order": 2, "priority": "high"},
            {"content": "Implement Redux Toolkit with async thunks and RTK Query", "order": 3, "priority": "medium"},
            {"content": "Create e-commerce sample project with cart functionality and user authentication", "order": 4, "priority": "high"},
            {"content": "Study React documentation sections on concurrent mode and Suspense", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['study', 'work', 'personal']
    );

    -- 10. Paris Weekend Trip
    PERFORM create_sample_todolist(
        'Paris Weekend Getaway',
        '[
            {"content": "Visit Eiffel Tower - book skip-the-line tickets for sunset (7 PM) viewing", "order": 1, "priority": "high"},
            {"content": "Tour Louvre Museum - focus on Mona Lisa, Venus de Milo, and Egyptian antiquities", "order": 2, "priority": "high"},
            {"content": "Take evening Seine River cruise with Bateaux Mouches at 8:30 PM", "order": 3, "priority": "medium"},
            {"content": "Shop at Champs-Élysées - visit Louis Vuitton flagship store and Ladurée", "order": 4, "priority": "low"},
            {"content": "Reserve table at LAmbroisie in Le Marais for traditional French cuisine", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['travel', 'weekend', 'vacation']
    );

    -- 11. Birthday Party Planning
    PERFORM create_sample_todolist(
        'Birthday Party Organization',
        '[
            {"content": "Create guest list with contact details and dietary restrictions - expect 30 people", "order": 1, "priority": "high"},
            {"content": "Book rooftop venue at The Grand Hotel - confirm AV equipment and seating", "order": 2, "priority": "high"},
            {"content": "Order custom cake from Sweet Delights Bakery - chocolate with fresh berries", "order": 3, "priority": "medium"},
            {"content": "Plan entertainment - hire jazz band for 2 hours and arrange party games", "order": 4, "priority": "medium"},
            {"content": "Design and send digital invitations via Paperless Post - RSVP deadline 2 weeks prior", "order": 5, "priority": "high"}
        ]'::jsonb,
        ARRAY['personal', 'project']
    );

    -- 12. Vegetarian Meal Prep
    PERFORM create_sample_todolist(
        'Weekly Vegetarian Meal Prep',
        '[
            {"content": "Prepare quinoa Buddha bowls with roasted chickpeas, sweet potato, and tahini dressing", "order": 1, "priority": "high"},
            {"content": "Cook coconut curry with cauliflower, spinach, and tofu - make extra sauce", "order": 2, "priority": "medium"},
            {"content": "Mix Mediterranean chickpea salad with cucumber, tomatoes, and lemon-herb dressing", "order": 3, "priority": "medium"},
            {"content": "Make hearty lentil soup with carrots, celery, and fresh herbs - portion for freezing", "order": 4, "priority": "medium"},
            {"content": "Prep roasted vegetables (brussels sprouts, carrots, broccoli) with garlic and herbs", "order": 5, "priority": "low"}
        ]'::jsonb,
        ARRAY['cooking', 'food', 'health']
    );

    -- 13. Office Setup
    PERFORM create_sample_todolist(
        'Home Office Setup',
        '[
            {"content": "Purchase Herman Miller Aeron chair - size B with lumbar support and adjustable arms", "order": 1, "priority": "high"},
            {"content": "Assemble standing desk - program height presets and test stability", "order": 2, "priority": "high"},
            {"content": "Install adjustable LED desk lamp and indirect ambient lighting for video calls", "order": 3, "priority": "medium"},
            {"content": "Set up cable management system with under-desk trays and velcro ties", "order": 4, "priority": "low"},
            {"content": "Add low-maintenance plants - snake plant and pothos with self-watering pots", "order": 5, "priority": "low"}
        ]'::jsonb,
        ARRAY['home', 'work', 'shopping']
    );

    -- 14. Website Launch
    PERFORM create_sample_todolist(
        'Website Launch Checklist',
        '[
            {"content": "Review all website content - check grammar, links, images, and mobile responsiveness", "order": 1, "priority": "high"},
            {"content": "Implement SEO best practices - meta tags, sitemap.xml, robots.txt, and schema markup", "order": 2, "priority": "high"},
            {"content": "Perform cross-browser testing on Chrome, Firefox, Safari, Edge - check all features", "order": 3, "priority": "high"},
            {"content": "Run security audit - SSL certificate, form validation, SQL injection prevention", "order": 4, "priority": "high"},
            {"content": "Set up automated daily backups for database and file system with retention policy", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['work', 'project']
    );

    -- 15. Garden Planning
    PERFORM create_sample_todolist(
        'Spring Garden Planning',
        '[
            {"content": "Design vegetable garden layout - companion planting map for tomatoes, herbs, and leafy greens", "order": 1, "priority": "high"},
            {"content": "Order heirloom vegetable seeds from Baker Creek - include succession planting varieties", "order": 2, "priority": "high"},
            {"content": "Prepare soil with organic compost and conduct pH test - adjust if needed", "order": 3, "priority": "medium"},
            {"content": "Install drip irrigation system with timer - separate zones for vegetables and herbs", "order": 4, "priority": "medium"},
            {"content": "Build three-bin composting system using pallets - add starter material", "order": 5, "priority": "low"}
        ]'::jsonb,
        ARRAY['home', 'project']
    );

    -- 16. Car Maintenance
    PERFORM create_sample_todolist(
        'Quarterly Car Maintenance',
        '[
            {"content": "Schedule oil change - synthetic oil 5W-30 and new filter at certified service center", "order": 1, "priority": "high"},
            {"content": "Rotate tires and check pressure - document tread wear patterns", "order": 2, "priority": "high"},
            {"content": "Inspect brake pads and rotors - measure pad thickness and surface condition", "order": 3, "priority": "high"},
            {"content": "Replace cabin and engine air filters - check for proper fit and seal", "order": 4, "priority": "medium"},
            {"content": "Detail car interior - vacuum, clean leather, and apply protectant to surfaces", "order": 5, "priority": "low"}
        ]'::jsonb,
        ARRAY['maintenance', 'personal']
    );

    -- 17. Photography Project
    PERFORM create_sample_todolist(
        'City Photography Project',
        '[
            {"content": "Research and map urban locations - focus on architecture and street scenes at golden hour", "order": 1, "priority": "high"},
            {"content": "Clean camera sensor, charge batteries, format memory cards - pack backup gear", "order": 2, "priority": "high"},
            {"content": "Capture sunrise shots at riverside - use ND filters for long exposures", "order": 3, "priority": "medium"},
            {"content": "Process RAW files in Lightroom - apply consistent color grading preset", "order": 4, "priority": "medium"},
            {"content": "Create online portfolio with 20 best shots - write location descriptions", "order": 5, "priority": "low"}
        ]'::jsonb,
        ARRAY['project', 'personal']
    );

    -- 18. Moving House
    PERFORM create_sample_todolist(
        'Moving House Checklist',
        '[
            {"content": "Pack room by room using color-coded labels - inventory valuable items", "order": 1, "priority": "high"},
            {"content": "Reserve professional moving company for June 15th - get insurance coverage", "order": 2, "priority": "high"},
            {"content": "Update address with post office, bank, and subscription services", "order": 3, "priority": "medium"},
            {"content": "Schedule utility transfers (electric, gas, internet) for moving day", "order": 4, "priority": "high"},
            {"content": "Deep clean old house - schedule professional carpet cleaning", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['home', 'project', 'personal']
    );

    -- 19. Language Learning
    PERFORM create_sample_todolist(
        'Spanish Learning Goals',
        '[
            {"content": "Complete 2 Duolingo lessons daily - focus on verb conjugation and vocabulary", "order": 1, "priority": "high"},
            {"content": "Watch Spanish movies with Spanish subtitles - 1 movie per week, take notes", "order": 2, "priority": "medium"},
            {"content": "Practice conversation with language exchange partner via Zoom - 30 mins, twice weekly", "order": 3, "priority": "high"},
            {"content": "Study Spanish grammar using Practice Makes Perfect workbook - 1 chapter per week", "order": 4, "priority": "medium"},
            {"content": "Read El País news website for 15 minutes daily - focus on current events section", "order": 5, "priority": "low"}
        ]'::jsonb,
        ARRAY['study', 'personal']
    );

    -- 20. Beach Vacation Prep
    PERFORM create_sample_todolist(
        'Beach Vacation Preparation',
        '[
            {"content": "Book beachfront accommodation - check reviews, amenities, and distance to attractions", "order": 1, "priority": "high"},
            {"content": "Research and book activities - snorkeling tour, sunset cruise, beach yoga classes", "order": 2, "priority": "medium"},
            {"content": "Pack beach essentials - umbrella, chairs, cooler, beach games, and first aid kit", "order": 3, "priority": "medium"},
            {"content": "Buy reef-safe sunscreen SPF 50+, after-sun lotion, and insect repellent", "order": 4, "priority": "high"},
            {"content": "Book round-trip airport transfers and research local transportation options", "order": 5, "priority": "high"}
        ]'::jsonb,
        ARRAY['travel', 'vacation', 'personal']
    );

END $$;

-- Cleanup
DROP FUNCTION IF EXISTS create_sample_todolist(TEXT, JSONB, TEXT[]); 