function fetchAndReportData() { 
    const url = "https://check.pa63.thistine.com/data.json"; // URL ที่ใช้ดึงข้อมูล JSON
    const lineToken = "LTFPuCdBsMMqsaSoP7rsIVDsNZGHJbWsxexJ7twEpuGe6n08LAIkAhYSTi6hVv6JQ7dW1KFK+hS4gJC7zeOPsdjUwfuE9g2ISqG50yTYJZd9+clGqxt1jyelDPVJJ1adaxJvGB/IcxkOps3aNxruTwdB04t89/1O/w1cDnyilFU="; // ใส่ Token ของ LINE Bot
    
    try {
      // ดึงข้อมูล JSON
      const response = UrlFetchApp.fetch(url);
      const data = JSON.parse(response.getContentText());
  
      // หาค่าวันที่ล่าสุดจากข้อมูล
      const dates = data.map(entry => entry.dutyDate);
      const latestDate = new Date(Math.max(...dates.map(date => new Date(date)))); // ค้นหาวันที่ล่าสุดจากข้อมูล
      const targetDate = latestDate.toISOString().split('T')[0]; // แปลงเป็นรูปแบบ "yyyy-mm-dd"
      
      // สร้างแผนผังการตรวจสอบเวรตามวัน
      const duties = {
        "Monday": ["ชัย", "ก้อง", "ฟาง", "หมิว"],
        "Tuesday": ["ตั้ม", "แก้ม", "ไทด์", "บอส"],
        "Wednesday": ["บุ๋ม", "นาย", "ณัฐ", "เจ้า"],
        "Thursday": ["น้ำอิง", "แนน", "ฟีฟ่า", "ไปร์ท"],
        "Friday": ["ข้าว", "ตี๋", "ติวเตอร์", "มิก"]
      };
      
      // กรองข้อมูลที่ตรงกับวันที่ล่าสุด
      const filteredData = data.filter(entry => entry.dutyDate === targetDate);
      
      if (filteredData.length > 0) {
        // ถ้ามีข้อมูลในวันที่ตรงกัน
        let message = `ข้อมูลสำหรับวันที่ ${targetDate}:\n`;
        const presentNames = filteredData.map(entry => entry.studentName); // เก็บชื่อของผู้ที่มาทำเวร
  
        filteredData.forEach(entry => {
          message += `👤 ชื่อนักเรียน: ${entry.studentName}\n📅 วันที่ปฏิบัติ: ${entry.dutyDate}\n📸 ภาพ: ${entry.dutyPhoto}\n\n`;
        });
  
        // ตรวจสอบชื่อที่ขาด
        const currentDay = new Date(targetDate).getDay(); // หาวันที่ของ targetDate
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const missingNames = duties[dayNames[currentDay]].filter(name => !presentNames.includes(name));
  
        if (missingNames.length > 0) {
          message += `\n⚠️ ขาดผู้ทำเวร: ${missingNames.join(", ")}`;
        } else {
          message += `\n✅ ทำเวรครบทุกคน`;
        }
  
        // ส่งข้อความไปยัง LINE
        const options = {
          method: 'post',
          headers: {
            'Authorization': `Bearer ${lineToken}`
          },
          contentType: 'application/json',
          payload: JSON.stringify({
            to: "U2378daf9502c6077d6b6a3ad0cb4cfac", // User ID ของแอดมิน
            messages: [{
              type: "text",
              text: message
            }]
          })
        };
  
        const lineResponse = UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push", options);
  
        // บันทึกการตอบกลับสำหรับการดีบัก
        Logger.log(`Response Code: ${lineResponse.getResponseCode()}`);
        Logger.log(`Response Body: ${lineResponse.getContentText()}`);
      } else {
        Logger.log(`ไม่มีข้อมูลสำหรับวันที่ ${targetDate}`);
      }
  
    } catch (e) {
      Logger.log(`Error: ${e.message}`);
    }
  }
  