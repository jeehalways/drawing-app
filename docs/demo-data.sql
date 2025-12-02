INSERT INTO "User" (id, name, birthday, "createdAt")
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Alice', '1995-05-01', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Bob', '1990-08-12', NOW());

INSERT INTO "Drawing" (id, "userId", "imageData", "createdAt")
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'demo-image-data-1', NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'demo-image-data-2', NOW());
