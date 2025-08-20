import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || Array.isArray(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid car ID",
    })
  }

  try {
    if (req.method === "GET") {
      const query = `
        SELECT 
          c.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', ci.id,
                'url', ci.image_url
              )
            ) FILTER (WHERE ci.id IS NOT NULL), 
            '[]'::json
          ) as images
        FROM cars c
        LEFT JOIN car_images ci ON c.id = ci.car_id
        WHERE c.id = $1
        GROUP BY c.id
      `

      const result = await db.query(query, [id])

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Car not found",
        })
      }

      return res.status(200).json({
        success: true,
        data: result.rows[0],
      })
    }

    if (req.method === "PUT") {
      const {
        name,
        brand,
        model,
        year,
        category,
        fuel_type,
        transmission,
        price,
        daily_price,
        color,
        description,
        images,
        status,
        available_from,
        min_driver_age,
        min_license_years,
        requires_credit_card,
          requires_deposit,
          location_id,
      } = req.body

      try {
        // Update car
        const carQuery = `
          UPDATE cars SET
            name = $1, brand = $2, model = $3, year = $4, category = $5,
            fuel_type = $6, transmission = $7, price = $8, daily_price = $9,
            color = $10, description = $11, status = $12,
            available_from = $13, min_driver_age = $14, min_license_years = $15,
            requires_credit_card = $16, requires_deposit = $17,
            location_id = $18,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $19
          RETURNING *
        `

        const carResult = await db.query(carQuery, [
          name || 'Araç',
          brand || 'Marka',
          model || 'Model',
          year || new Date().getFullYear(),
          category || 'Sedan',
          fuel_type || 'Benzin',
          transmission || 'Otomatik',
          price || 0,
          daily_price || 0,
          color || 'Siyah',
          description || '',
          status || 'available',
          available_from || new Date().toISOString().split('T')[0],
          min_driver_age || 21,
          min_license_years || 2,
          Boolean(requires_credit_card),
          Boolean(requires_deposit),
          location_id ? parseInt(location_id) : null,
          id,
        ])

        if (carResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Car not found",
          })
        }

        // Update images
        if (images && images.length > 0) {
          // Delete existing images
          await db.query("DELETE FROM car_images WHERE car_id = $1", [id])

          // Insert new images
          for (let i = 0; i < images.length; i++) {
            const imageUrl = typeof images[i] === 'string' ? images[i] : images[i].url || images[i]
            await db.query(
              "INSERT INTO car_images (car_id, image_url) VALUES ($1, $2)",
              [id, imageUrl],
            )
          }
        }

        // Fetch the updated car with images
        const updatedCarQuery = `
          SELECT 
            c.*,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', ci.id,
                  'url', ci.image_url
                )
              ) FILTER (WHERE ci.id IS NOT NULL), 
              '[]'::json
            ) as images
          FROM cars c
          LEFT JOIN car_images ci ON c.id = ci.car_id
          WHERE c.id = $1
          GROUP BY c.id
        `

        const updatedCarResult = await db.query(updatedCarQuery, [id])

        return res.status(200).json({
          success: true,
          message: "Car updated successfully",
          data: updatedCarResult.rows[0] || carResult.rows[0],
        })
      } catch (error) {
        throw error
      }
    }

    if (req.method === "DELETE") {
      try {
        await db.query("BEGIN")

        // Delete images first
        await db.query("DELETE FROM car_images WHERE car_id = $1", [id])

        // Delete car
        const result = await db.query("DELETE FROM cars WHERE id = $1 RETURNING *", [id])

        if (result.rows.length === 0) {
          await db.query("ROLLBACK")
          return res.status(404).json({
            success: false,
            message: "Car not found",
          })
        }

        await db.query("COMMIT")

        return res.status(200).json({
          success: true,
          message: "Car deleted successfully",
        })
      } catch (error) {
        await db.query("ROLLBACK")
        throw error
      }
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    })
  } catch (error) {
    console.error("API Error:", error instanceof Error ? error.message : error)
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + (error instanceof Error ? error.message : String(error)),
    })
  }
}