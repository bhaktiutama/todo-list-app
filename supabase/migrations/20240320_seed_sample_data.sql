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
            {"content": "Make homemade pasta dough", "order": 1, "priority": "high"},
            {"content": "Prepare tomato sauce", "order": 2, "priority": "high"},
            {"content": "Make tiramisu", "order": 3, "priority": "medium"},
            {"content": "Prepare garlic bread", "order": 4, "priority": "low"},
            {"content": "Buy Italian wine", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['cooking', 'recipe', 'food']
    );

    -- 2. Tokyo Travel Itinerary
    PERFORM create_sample_todolist(
        'Tokyo 5-Day Trip Plan',
        '[
            {"content": "Visit Tsukiji Fish Market", "order": 1, "priority": "high"},
            {"content": "Explore Akihabara", "order": 2, "priority": "medium"},
            {"content": "Day trip to Mt. Fuji", "order": 3, "priority": "high"},
            {"content": "Shopping in Shibuya", "order": 4, "priority": "medium"},
            {"content": "Visit Senso-ji Temple", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['travel', 'vacation']
    );

    -- 3. Weekly Work Tasks
    PERFORM create_sample_todolist(
        'Weekly Sprint Tasks',
        '[
            {"content": "Code review for frontend PR", "order": 1, "priority": "high"},
            {"content": "Update API documentation", "order": 2, "priority": "medium"},
            {"content": "Team meeting preparation", "order": 3, "priority": "high"},
            {"content": "Debug production issue", "order": 4, "priority": "high"},
            {"content": "Write unit tests", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['work', 'project']
    );

    -- 4. Monthly Grocery Shopping
    PERFORM create_sample_todolist(
        'Monthly Grocery List',
        '[
            {"content": "Fresh vegetables and fruits", "order": 1, "priority": "high"},
            {"content": "Meat and fish", "order": 2, "priority": "high"},
            {"content": "Dairy products", "order": 3, "priority": "medium"},
            {"content": "Cleaning supplies", "order": 4, "priority": "low"},
            {"content": "Snacks and beverages", "order": 5, "priority": "low"}
        ]'::jsonb,
        ARRAY['shopping', 'home']
    );

    -- 5. Home Maintenance
    PERFORM create_sample_todolist(
        'Spring Home Maintenance',
        '[
            {"content": "Clean gutters", "order": 1, "priority": "high"},
            {"content": "Check smoke detectors", "order": 2, "priority": "high"},
            {"content": "Service HVAC system", "order": 3, "priority": "medium"},
            {"content": "Pressure wash deck", "order": 4, "priority": "low"},
            {"content": "Clean windows", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['home', 'maintenance']
    );

    -- 6. Fitness Goals
    PERFORM create_sample_todolist(
        'Monthly Fitness Goals',
        '[
            {"content": "Run 5km 3x per week", "order": 1, "priority": "high"},
            {"content": "Strength training Mon/Wed/Fri", "order": 2, "priority": "high"},
            {"content": "Yoga sessions Tue/Thu", "order": 3, "priority": "medium"},
            {"content": "Track daily calories", "order": 4, "priority": "medium"},
            {"content": "Weekly progress photos", "order": 5, "priority": "low"}
        ]'::jsonb,
        ARRAY['fitness', 'personal']
    );

    -- 7. Thai Cooking Class Prep
    PERFORM create_sample_todolist(
        'Thai Cooking Class Preparation',
        '[
            {"content": "Buy Thai curry paste", "order": 1, "priority": "high"},
            {"content": "Get fresh lemongrass", "order": 2, "priority": "high"},
            {"content": "Prepare coconut milk", "order": 3, "priority": "medium"},
            {"content": "Get rice noodles", "order": 4, "priority": "medium"},
            {"content": "Buy fish sauce", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['cooking', 'shopping', 'food']
    );

    -- 8. Weekend DIY Project
    PERFORM create_sample_todolist(
        'Build a Garden Bench',
        '[
            {"content": "Buy lumber and supplies", "order": 1, "priority": "high"},
            {"content": "Cut wood to size", "order": 2, "priority": "high"},
            {"content": "Sand all pieces", "order": 3, "priority": "medium"},
            {"content": "Assemble frame", "order": 4, "priority": "high"},
            {"content": "Paint and seal", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['home', 'weekend', 'project']
    );

    -- 9. Study Plan
    PERFORM create_sample_todolist(
        'React Advanced Concepts Study',
        '[
            {"content": "Learn React Hooks", "order": 1, "priority": "high"},
            {"content": "Practice Context API", "order": 2, "priority": "high"},
            {"content": "Study Redux patterns", "order": 3, "priority": "medium"},
            {"content": "Build sample project", "order": 4, "priority": "high"},
            {"content": "Review documentation", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['study', 'work', 'personal']
    );

    -- 10. Paris Weekend Trip
    PERFORM create_sample_todolist(
        'Paris Weekend Getaway',
        '[
            {"content": "Visit Eiffel Tower", "order": 1, "priority": "high"},
            {"content": "Louvre Museum tour", "order": 2, "priority": "high"},
            {"content": "Seine River cruise", "order": 3, "priority": "medium"},
            {"content": "Shop at Champs-Élysées", "order": 4, "priority": "low"},
            {"content": "Dinner at Le Marais", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['travel', 'weekend', 'vacation']
    );

    -- 11. Birthday Party Planning
    PERFORM create_sample_todolist(
        'Birthday Party Organization',
        '[
            {"content": "Create guest list", "order": 1, "priority": "high"},
            {"content": "Book venue", "order": 2, "priority": "high"},
            {"content": "Order cake", "order": 3, "priority": "medium"},
            {"content": "Plan activities", "order": 4, "priority": "medium"},
            {"content": "Send invitations", "order": 5, "priority": "high"}
        ]'::jsonb,
        ARRAY['personal', 'project']
    );

    -- 12. Vegetarian Meal Prep
    PERFORM create_sample_todolist(
        'Weekly Vegetarian Meal Prep',
        '[
            {"content": "Quinoa Buddha bowls", "order": 1, "priority": "high"},
            {"content": "Vegetable curry", "order": 2, "priority": "medium"},
            {"content": "Chickpea salad", "order": 3, "priority": "medium"},
            {"content": "Lentil soup", "order": 4, "priority": "medium"},
            {"content": "Roasted vegetables", "order": 5, "priority": "low"}
        ]'::jsonb,
        ARRAY['cooking', 'food', 'health']
    );

    -- 13. Office Setup
    PERFORM create_sample_todolist(
        'Home Office Setup',
        '[
            {"content": "Buy ergonomic chair", "order": 1, "priority": "high"},
            {"content": "Set up desk", "order": 2, "priority": "high"},
            {"content": "Install lighting", "order": 3, "priority": "medium"},
            {"content": "Cable management", "order": 4, "priority": "low"},
            {"content": "Add plants", "order": 5, "priority": "low"}
        ]'::jsonb,
        ARRAY['home', 'work', 'shopping']
    );

    -- 14. Website Launch
    PERFORM create_sample_todolist(
        'Website Launch Checklist',
        '[
            {"content": "Final content review", "order": 1, "priority": "high"},
            {"content": "SEO optimization", "order": 2, "priority": "high"},
            {"content": "Cross-browser testing", "order": 3, "priority": "high"},
            {"content": "Security checks", "order": 4, "priority": "high"},
            {"content": "Backup systems", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['work', 'project']
    );

    -- 15. Garden Planning
    PERFORM create_sample_todolist(
        'Spring Garden Planning',
        '[
            {"content": "Plan vegetable layout", "order": 1, "priority": "high"},
            {"content": "Buy seeds", "order": 2, "priority": "high"},
            {"content": "Prepare soil", "order": 3, "priority": "medium"},
            {"content": "Set up irrigation", "order": 4, "priority": "medium"},
            {"content": "Create compost area", "order": 5, "priority": "low"}
        ]'::jsonb,
        ARRAY['home', 'project']
    );

    -- 16. Car Maintenance
    PERFORM create_sample_todolist(
        'Quarterly Car Maintenance',
        '[
            {"content": "Oil change", "order": 1, "priority": "high"},
            {"content": "Tire rotation", "order": 2, "priority": "high"},
            {"content": "Check brakes", "order": 3, "priority": "high"},
            {"content": "Replace air filter", "order": 4, "priority": "medium"},
            {"content": "Clean interior", "order": 5, "priority": "low"}
        ]'::jsonb,
        ARRAY['maintenance', 'personal']
    );

    -- 17. Photography Project
    PERFORM create_sample_todolist(
        'City Photography Project',
        '[
            {"content": "Scout locations", "order": 1, "priority": "high"},
            {"content": "Check equipment", "order": 2, "priority": "high"},
            {"content": "Morning shoot", "order": 3, "priority": "medium"},
            {"content": "Edit photos", "order": 4, "priority": "medium"},
            {"content": "Prepare portfolio", "order": 5, "priority": "low"}
        ]'::jsonb,
        ARRAY['project', 'personal']
    );

    -- 18. Moving House
    PERFORM create_sample_todolist(
        'Moving House Checklist',
        '[
            {"content": "Pack room by room", "order": 1, "priority": "high"},
            {"content": "Book moving company", "order": 2, "priority": "high"},
            {"content": "Update address", "order": 3, "priority": "medium"},
            {"content": "Transfer utilities", "order": 4, "priority": "high"},
            {"content": "Clean old house", "order": 5, "priority": "medium"}
        ]'::jsonb,
        ARRAY['home', 'project', 'personal']
    );

    -- 19. Language Learning
    PERFORM create_sample_todolist(
        'Spanish Learning Goals',
        '[
            {"content": "Daily Duolingo", "order": 1, "priority": "high"},
            {"content": "Watch Spanish movies", "order": 2, "priority": "medium"},
            {"content": "Practice conversation", "order": 3, "priority": "high"},
            {"content": "Learn grammar", "order": 4, "priority": "medium"},
            {"content": "Read Spanish news", "order": 5, "priority": "low"}
        ]'::jsonb,
        ARRAY['study', 'personal']
    );

    -- 20. Beach Vacation Prep
    PERFORM create_sample_todolist(
        'Beach Vacation Preparation',
        '[
            {"content": "Book accommodation", "order": 1, "priority": "high"},
            {"content": "Plan activities", "order": 2, "priority": "medium"},
            {"content": "Pack beach gear", "order": 3, "priority": "medium"},
            {"content": "Get sunscreen", "order": 4, "priority": "high"},
            {"content": "Arrange transport", "order": 5, "priority": "high"}
        ]'::jsonb,
        ARRAY['travel', 'vacation', 'personal']
    );

END $$;

-- Cleanup
DROP FUNCTION IF EXISTS create_sample_todolist(TEXT, JSONB, TEXT[]); 