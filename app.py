import re
import json
import time
import datetime

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By

from webdriver_manager.utils import ChromeType
from webdriver_manager.chrome import ChromeDriverManager



class Log():
    def read_json(self, filename):
        with open(f"./data/{filename}",  encoding="utf-8", mode="r") as File:
            data = json.load(File)
        return data

    def write_json(self, filename, data):
        with open(f"./data/{filename}",  encoding="utf-8", mode="w") as File:
            File.write(json.dumps(data, ensure_ascii=False, indent=4))

class Main(Log):
    def __init__(self) -> None:        

        chrome_service = Service(ChromeDriverManager(chrome_type=ChromeType.CHROMIUM).install())

        chrome_options = webdriver.ChromeOptions();

        options = [
            "--headless",
            "--disable-gpu",
            "--window-size=1920,1200",
            "--ignore-certificate-errors",
            "--disable-extensions",
            "--no-sandbox",
            "--disable-dev-shm-usage"
            "--user-agent=Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.2 (KHTML, like Gecko) Chrome/22.0.1216.0 Safari/537.2"
            "--proxy-server=91.243.35.205:80"
        ]
        for option in options:
            chrome_options.add_argument(option)

        self.driver = webdriver.Chrome(service=chrome_service, options=chrome_options)
        
    def get_like(self, id):
        value = self.driver.find_element(by=By.XPATH, value=f"//*[@id='like_sentence_{id}']").text
        value_int = re.findall("\d+", value)[0]
        return int(value_int) + 1

    def get_share(self, id):
        value = self.driver.find_element(by=By.XPATH, value=f"//*[@id='ufi_{id}']/div/div[3]/a/span").text
        value_int = re.findall("\d+", value.replace(",", ""))[0]
        return int(value_int)

    def get_point(self, like, share):
        # 👍🏻 1 Like = 1 คะแนน 
        # ⤴️ 1 Share = 5 คะแนน
        return (share * 5) + like

    def run(self):

        self.member_data = self.read_json("member.json")
        
        for i in self.member_data['data']:
            self.driver.get(i['url'])
            self.driver.implicitly_wait(30)
            time.sleep(0.5)


            page_id = i['url'].replace("https://m.facebook.com/photo.php?fbid=", "")

            # get data value
            like = self.get_like(page_id)
            time.sleep(0.5)
            share = self.get_share(page_id)
            time.sleep(0.5)
            point = self.get_point(like, share)
            time.sleep(0.5)



            # update data value
            i['data']['old_like'] = i['data']['like']
            i['data']['old_share'] = i['data']['share']
            i['data']['old_point'] = i['data']['point']


            i['data']['like'] = like
            i['data']['share'] = share
            i['data']['point'] = point



            print(f"[{i['type']}{i['id']}] Point: {point} Like: {like} Share: {share}")
        

        self.member_data['updated_at'] = str(datetime.datetime.now())
        self.write_json("member.json", self.member_data)
        self.driver.close()

if __name__ == "__main__":
    m = Main()
    m.run()