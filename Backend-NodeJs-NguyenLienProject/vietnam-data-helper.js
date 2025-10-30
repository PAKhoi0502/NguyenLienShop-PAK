/**
 * Helper script to fetch Vietnam location data from API and prepare seeders
 * Run: node vietnam-data-helper.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// API endpoints
const PROVINCES_API = 'https://provinces.open-api.vn/api/p/';
const DISTRICTS_API = 'https://provinces.open-api.vn/api/d/';
const WARDS_API = 'https://provinces.open-api.vn/api/w/';

// Function to fetch data from API
function fetchData(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Transform province data for seeder
function transformProvinces(provinces) {
    return provinces.map(p => ({
        code: p.code.toString(),
        name: p.name,
        nameEn: p.name_en || null,
        fullName: p.full_name || p.name,
        fullNameEn: p.full_name_en || p.name_en || null,
        codeName: p.code_name || null,
        administrativeUnitId: p.administrative_unit_id || null,
        administrativeRegionId: p.administrative_region_id || null,
        createdAt: new Date(),
        updatedAt: new Date()
    }));
}

// Transform district data for seeder
function transformDistricts(districts) {
    return districts.map(d => ({
        code: d.code.toString(),
        name: d.name,
        nameEn: d.name_en || null,
        fullName: d.full_name || d.name,
        fullNameEn: d.full_name_en || d.name_en || null,
        codeName: d.code_name || null,
        provinceCode: d.province_code.toString(),
        administrativeUnitId: d.administrative_unit_id || null,
        createdAt: new Date(),
        updatedAt: new Date()
    }));
}

// Transform ward data for seeder
function transformWards(wards) {
    return wards.map(w => ({
        code: w.code.toString(),
        name: w.name,
        nameEn: w.name_en || null,
        fullName: w.full_name || w.name,
        fullNameEn: w.full_name_en || w.name_en || null,
        codeName: w.code_name || null,
        districtCode: w.district_code.toString(),
        administrativeUnitId: w.administrative_unit_id || null,
        createdAt: new Date(),
        updatedAt: new Date()
    }));
}

// Generate seeder file content
function generateSeederContent(tableName, data, batchSize = 100) {
    const batches = [];
    for (let i = 0; i < data.length; i += batchSize) {
        batches.push(data.slice(i, i + batchSize));
    }

    return `'use strict';

module.exports = {
   async up(queryInterface, Sequelize) {
      // Insert data in batches to avoid memory issues
      const batches = ${JSON.stringify(batches, null, 6)};
      
      for (const batch of batches) {
         await queryInterface.bulkInsert('${tableName}', batch, {});
      }
      
      console.log('✅ ${tableName}: Inserted ${data.length} records');
   },

   async down(queryInterface, Sequelize) {
      await queryInterface.bulkDelete('${tableName}', null, {});
   }
};
`;
}

// Main function
async function main() {
    console.log('🚀 Fetching Vietnam location data...\n');

    try {
        // Fetch Provinces
        console.log('📍 Fetching provinces...');
        const provinces = await fetchData(PROVINCES_API);
        const provincesData = transformProvinces(provinces);
        console.log(`✅ Found ${provincesData.length} provinces\n`);

        // Fetch Districts
        console.log('📍 Fetching districts...');
        const districts = await fetchData(DISTRICTS_API);
        const districtsData = transformDistricts(districts);
        console.log(`✅ Found ${districtsData.length} districts\n`);

        // Fetch Wards
        console.log('📍 Fetching wards...');
        const wards = await fetchData(WARDS_API);
        const wardsData = transformWards(wards);
        console.log(`✅ Found ${wardsData.length} wards\n`);

        // Generate seeder files
        console.log('📝 Generating seeder files...\n');

        const seedersPath = path.join(__dirname, 'src', 'seeders');

        // Create seeders directory if not exists
        if (!fs.existsSync(seedersPath)) {
            fs.mkdirSync(seedersPath, { recursive: true });
        }

        // Write Provinces seeder
        const provincesSeeder = generateSeederContent('Provinces', provincesData, 63);
        fs.writeFileSync(
            path.join(seedersPath, '002-seed-provinces.js'),
            provincesSeeder
        );
        console.log('✅ Created 002-seed-provinces.js');

        // Write Districts seeder
        const districtsSeeder = generateSeederContent('Districts', districtsData, 100);
        fs.writeFileSync(
            path.join(seedersPath, '003-seed-districts.js'),
            districtsSeeder
        );
        console.log('✅ Created 003-seed-districts.js');

        // Write Wards seeder (split into smaller batches due to large size)
        const wardsSeeder = generateSeederContent('Wards', wardsData, 200);
        fs.writeFileSync(
            path.join(seedersPath, '004-seed-wards.js'),
            wardsSeeder
        );
        console.log('✅ Created 004-seed-wards.js');

        console.log('\n🎉 Done! Seeder files generated successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Provinces: ${provincesData.length} records`);
        console.log(`   - Districts: ${districtsData.length} records`);
        console.log(`   - Wards: ${wardsData.length} records`);
        console.log(`   - Total: ${provincesData.length + districtsData.length + wardsData.length} records`);
        console.log('\n🚀 Next steps:');
        console.log('   1. Run migrations: npx sequelize-cli db:migrate');
        console.log('   2. Run seeders: npx sequelize-cli db:seed:all');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run
main();

