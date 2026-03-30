ALTER TABLE "arrathon_location" DROP CONSTRAINT "uq_arrathon_location_order";
ALTER TABLE "arrathon_location" ADD CONSTRAINT "uq_arrathon_location_order" UNIQUE ("arrathon_id", "order_position") DEFERRABLE INITIALLY DEFERRED;
