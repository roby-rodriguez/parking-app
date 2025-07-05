-- Add foreign key from parking_access_history.parking_lot_id to parking_lots.id
ALTER TABLE parking_access_history
ADD CONSTRAINT fk_parking_access_history_parking_lot
FOREIGN KEY (parking_lot_id)
REFERENCES parking_lots(id); 