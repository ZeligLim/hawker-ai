INSERT INTO restaurants (id, name, slug, address, lat, lng)
VALUES
  ('d6d0d8f1-5d4b-4d74-b4ef-12bbf7e6ddab', 'Nasi Lemak Pak Mat', 'nasi-lemak-pak-mat', 'Jalan Alor, Kuala Lumpur', 3.147800, 101.709800),
  ('5e5b8e8e-6d6e-42d9-bd75-9d0bdfa55af0', 'Curry Mee Corner', 'curry-mee-corner', 'Petaling Street, Kuala Lumpur', 3.142000, 101.694600),
  ('8af690e9-7dc8-4f4b-9d4c-0d4ee99f5d12', 'Char Kway Teow Stall', 'char-kway-teow-stall', 'Taman Connaught, Cheras', 3.076700, 101.746400);

INSERT INTO food_outlets (id, restaurant_id, name)
VALUES
  ('c46f62c4-a1d9-4428-88f2-759da5cd9e16', 'd6d0d8f1-5d4b-4d74-b4ef-12bbf7e6ddab', 'Kedai Nasi Lemak Pak Mat'),
  ('7dcb4f2d-6cfb-4bb0-9012-af2f3cd4dca4', '5e5b8e8e-6d6e-42d9-bd75-9d0bdfa55af0', 'Curry Mee Corner Stall'),
  ('1cab0e49-6606-4e7c-96a7-1d875e8af6b5', '8af690e9-7dc8-4f4b-9d4c-0d4ee99f5d12', 'Char Kway Teow Stall 1');

INSERT INTO dishes (id, food_outlet_id, name, price, is_vegetarian, is_halal, spice_level, protein_grams)
VALUES
  ('9ef7b4df-b1db-4d66-8d9a-00d7c1d708a9', 'c46f62c4-a1d9-4428-88f2-759da5cd9e16', 'Nasi Lemak', 8.50, FALSE, TRUE, 2, 28.00),
  ('f6a54d72-7f56-4a45-8f8d-e9bc5a1d1bea', '7dcb4f2d-6cfb-4bb0-9012-af2f3cd4dca4', 'Curry Mee', 12.00, FALSE, TRUE, 4, 32.00),
  ('a2d9cc58-8975-4f20-809b-abc4d5d5c4d3', '1cab0e49-6606-4e7c-96a7-1d875e8af6b5', 'Char Kway Teow', 11.50, FALSE, FALSE, 3, 26.00);

INSERT INTO ingredients (id, name)
VALUES
  ('d2abbe1d-48d1-4f0a-b5f1-6df4c87fbfef', 'Rice'),
  ('de1adfc4-f6cf-480f-9fc5-7d2a6ea1c1d3', 'Coconut Milk'),
  ('522f6678-644b-43e4-8ae8-9d7db4a716cb', 'Chili'),
  ('7f97a7a2-c8c7-4f41-8f8e-f38714d3ed0a', 'Egg'),
  ('05f63dc7-bd11-4c88-93fd-12ef45708f37', 'Prawns'),
  ('0ae8c95d-f6a0-49d7-8388-38a5fb1f54e1', 'Bean Sprouts'),
  ('bb80d8ae-7156-4a53-9d4a-d6d04ee2c8e2', 'Flat Rice Noodles'),
  ('67a14e7b-bce4-42d6-99eb-4d5bd884f9db', 'Cockles');

INSERT INTO dish_ingredients (id, dish_id, ingredient_id)
VALUES
  ('4ac4a855-5f3b-4705-a4d7-24f8d18d0fdd', '9ef7b4df-b1db-4d66-8d9a-00d7c1d708a9', 'd2abbe1d-48d1-4f0a-b5f1-6df4c87fbfef'),
  ('b32cd8c7-bf0a-4b29-92c3-0ef9a8255fe0', '9ef7b4df-b1db-4d66-8d9a-00d7c1d708a9', 'de1adfc4-f6cf-480f-9fc5-7d2a6ea1c1d3'),
  ('2b7d19a1-7c89-4d6a-b13d-9ad9f3d2a014', '9ef7b4df-b1db-4d66-8d9a-00d7c1d708a9', '522f6678-644b-43e4-8ae8-9d7db4a716cb'),
  ('8f49e4d8-d8ae-47ed-9c78-9f4ed5dd0e31', '9ef7b4df-b1db-4d66-8d9a-00d7c1d708a9', '7f97a7a2-c8c7-4f41-8f8e-f38714d3ed0a'),
  ('5402e6f8-a585-45b2-a2d0-46d13bf4734d', 'f6a54d72-7f56-4a45-8f8d-e9bc5a1d1bea', 'de1adfc4-f6cf-480f-9fc5-7d2a6ea1c1d3'),
  ('2e8ab0c6-000a-4d6a-b7d9-e9e2ce38e058', 'f6a54d72-7f56-4a45-8f8d-e9bc5a1d1bea', '522f6678-644b-43e4-8ae8-9d7db4a716cb'),
  ('50eb306b-5e23-4db4-aeb2-4af9d9c17f66', 'f6a54d72-7f56-4a45-8f8d-e9bc5a1d1bea', '05f63dc7-bd11-4c88-93fd-12ef45708f37'),
  ('f42d5968-45d7-4a99-9243-a69bd7a7ad44', 'a2d9cc58-8975-4f20-809b-abc4d5d5c4d3', '7f97a7a2-c8c7-4f41-8f8e-f38714d3ed0a'),
  ('3d4d42f1-f7ef-43ac-9b37-2d9eebe4b55d', 'a2d9cc58-8975-4f20-809b-abc4d5d5c4d3', '0ae8c95d-f6a0-49d7-8388-38a5fb1f54e1'),
  ('7d2e0cb5-bb4d-418b-a985-4a3d1d268d04', 'a2d9cc58-8975-4f20-809b-abc4d5d5c4d3', 'bb80d8ae-7156-4a53-9d4a-d6d04ee2c8e2'),
  ('f5d32cf5-4ee1-4b3c-bb90-31485e64ae4e', 'a2d9cc58-8975-4f20-809b-abc4d5d5c4d3', '67a14e7b-bce4-42d6-99eb-4d5bd884f9db');
