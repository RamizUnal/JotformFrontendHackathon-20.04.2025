# Jotform Frontend Hackathon Project

## User Information
Please fill in your information after forking this repository:

- **Name**: [Ramiz Arda Ünal]

## Project Description
This is a basic e-commerce website implementation that gets its data from the API provided.

Some core implementations:

Showing all products in a nice, organised format.
Having a pagination control that matches the system's UI
Search function that works on different pages that can search based on product name / description
Add to cart buttons that response differently if the item is already present on the card or not.
If an item is already on the cart the user can choose to increment / decrement the amount.
Basic notifications.
Cart items that do not dissappear during a reload.
Liked items, that respond to if a liked item is present in the cart or not, if so the user can still increment/decrement.
Basic product information implementation that does not send to a new page, works well with items already present in the cart.
Clicking on a product will give more information about that product in a card.

Category implementation that works well with the page's layout, the user can choose from a variety of categories

In product information, any product also lists other products that are related. The user can add these to the card from here as well.

IMPORTANT: DUE TO HOW THE PRODUCTS ARE CODED, ANY RELATED PRODUCT TO ONE PRODUCT WILL HAVE THE SAME NAME, BUT DIFFERENT ID'S
THIS IS HOW IT'S IMPLEMENTED, NOT AN ERROR. TECHNICALLY THESE ARE DIFFERENT PRODUCTS WITH DIFFERENT ID'S

Submission works, shows the correct sum and sends the correct time

ADDED OPTIMIZED IMAGES FOR FASTER LOAD TIME

## Getting Started
To start, go to the project folder and simply type "npm run dev" in the terminal
You can change the store type by gping to jotformApi.js and changing 
    const CURRENT_STORE_ID = FORM_IDS.store3;
to store2 or 1. Best works in store3. It will also yield an error if your try any number other than 1 2 3 so its modular, more stores can be added.


## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 

# 🚀 Hackathon Duyurusu

## 📅 Tarih ve Saat
Pazar günü saat 11:00'da başlayacak.

## 🎯 Hackathon Konsepti
Bu hackathon'da, size özel hazırlanmış bir senaryo üzerine web uygulaması geliştirmeniz istenecektir. Hackathon başlangıcında senaryo detayları paylaşılacaktır.Katılımcılar, verilen GitHub reposunu fork ederek kendi geliştirme ortamlarını oluşturacaklardır.

## 📦 GitHub Reposu
Hackathon için kullanılacak repo: [JotformFrontendHackathon-20.04.2025](https://github.com/erayaydinJF/JotformFrontendHackathon-20.04.2025)

## 🛠️ Hazırlık Süreci
1. GitHub reposunu fork edin
2. Tercih ettiğiniz framework ile geliştirme ortamınızı hazırlayın
3. Hazırladığınız setup'ı fork ettiğiniz repoya gönderin

## 💡 Önemli Notlar
- Katılımcılar kendi tercih ettikleri framework'leri kullanabilirler
- Geliştirme ortamınızı önceden hazırlayıp reponuza göndermeniz önerilir
