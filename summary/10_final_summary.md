# Generatywne AI w Grafice — Nowe Możliwości dla Programistów

![Okładka](https://cloud.overment.com/S02E03-1731372201.png)

Rozwój generatywnego AI w dziedzinie przetwarzania tekstu i obrazów przynosi coraz więcej narzędzi do manipulacji i tworzenia grafik oraz zdjęć. Tradycyjnie projektowanie wizualne nie było bezpośrednio związane z programowaniem, jednak generatywne AI zmienia ten stan rzeczy, angażując programistów w obszary dotychczas zarezerwowane dla projektantów i ilustratorów.

## Generatywne Narzędzia AI

Narzędzia takie jak [Midjourney](tools/Midjourney.md) i [Stable Diffusion](glossary/Stable%20Diffusion.md), wcześniej wykorzystywane głównie przez grafików, teraz zyskują na popularności wśród programistów. Dzięki integracji tych narzędzi, deweloperzy mogą wzbogacać swoje aplikacje o nowe funkcjonalności.

Przykładem jest [picthing](https://pic.ping.gg/) stworzone przez Theo z `t3.gg`, które umożliwia wysokiej jakości usuwanie tła ze zdjęć, przewyższając jakością wiele istniejących metod.

![](https://cloud.overment.com/2024-09-26/aidevs3_picthing-a5ce0e6a-b.png)

### Projekty Pietera Levelsa

[PhotoAI](https://photoai.com/) i [InteriorAI](https://interiorai.com) to projekty [Pietera Levelsa](https://x.com/levelsio), które wykorzystują generatywne AI do rozwiązywania konkretnych problemów, co potwierdzają udostępnione przez niego statystyki użytkowania.

![](https://cloud.overment.com/2024-09-26/aidevs3_levelsio-55df5a6e-5.png)

## Obecne Możliwości Generowania Obrazu

Postęp w generowaniu grafik przez AI w ciągu ostatnich dwóch lat jest imponujący. Artykuł [Comparing AI-generated images two years apart — 2022 vs. 2024](https://medium.com/@junehao/comparing-ai-generated-images-two-years-apart-2022-vs-2024-6c3c4670b905) ukazuje znaczną poprawę jakości generowanych obrazów. Jednak modele jak [Flux](glossary/Flux.md) nadal napotykają trudności w generowaniu konkretnych elementów, takich jak tekst, dłonie czy odbicia.

![](https://cloud.overment.com/2024-09-26/aidevs3_midjourney-79dd9b18-9.png)

Mimo tych ograniczeń, obecna jakość generowanych obrazów jest bardzo wysoka. Modele AI mogą być stosowane nie tylko do tworzenia nowych obrazów, ale także do edycji istniejących grafik. Narzędzie [ComfyUI](ComfyUI) pokazuje, jak można modyfikować twarz na zdjęciu wygenerowanym za pomocą [Midjourney](tools/Midjourney.md).

![](https://cloud.overment.com/2024-09-26/aidevs3_swap-92e327ca-8.png)

## Wdrożenie Modeli Poprzez API i Samoobsługa

Dla programistów istotne jest, że modele są dostępne poprzez API lub mogą być hostowane samodzielnie. Usługi takie jak [Replicate](tools/Replicate.md) i [Leonardo.ai](https://leonardo.ai/) umożliwiają integrację zaawansowanych modeli graficznych przez API. Platforma [RunPod](https://blog.runpod.io/how-to-get-stable-diffusion-set-up-with-comfyui-on-runpod/) oferuje dostęp do GPU dla własnych wdrożeń modeli, takich jak [Stable Diffusion](glossary/Stable%20Diffusion.md).

Podczas manipulacji obrazami, wykorzystanie szablonów jest nieocenione, zwłaszcza w celach marketingowych, takich jak tworzenie reklam czy grafik na blogi. Pozwala to na automatyzację modyfikacji zdjęć i tekstów, oszczędzając czas i zachowując spójność wizualną.

![](https://cloud.overment.com/2024-09-26/aidevs3_eduweb-b678b9a8-5.png)

## Znaczenie Promptów i Metapromptów

Podobnie jak w przypadku dużych modeli językowych (LLM), generowanie grafik opiera się na odpowiednim formułowaniu promptów. Używanie słów kluczowych oraz flag sterujących ustawieniami jest kluczowe. Obrazy referencyjne pomagają w zachowaniu spójności stylu, co jest istotne dla projektów zgodnych z identyfikacją wizualną marki. Przykład promptu z [Midjourney](tools/Midjourney.md) pokazuje, jak zastosowanie metapromptów może prowadzić do uzyskania spójnych i oczekiwanych rezultatów.

![](https://cloud.overment.com/2024-09-27/aidevs3_smoke-2656d5ad-6.png)

## Narzędzia oparte na Szablonach HTML

Narzędzia takie jak [ComfyUI](ComfyUI) i [htmlcsstoimage](https://htmlcsstoimage.com) umożliwiają generowanie obrazów na podstawie szablonów HTML, które mogą być dynamicznie modyfikowane za pomocą API. Daje to szerokie możliwości w dostosowywaniu grafiki do potrzeb użytkownika, zachowując pełną kontrolę nad stylem i formatem.

![](https://cloud.overment.com/2024-09-27/aidevs3_htmlcsstoimage-c6f590af-a.png)

## Podsumowanie

Generatywne narzędzia graficzne AI otwierają przed programistami nowe możliwości automatyzacji i tworzenia wyspecjalizowanych narzędzi do przekształcania obrazów. Nawet jeśli nie zajmujemy się bezpośrednio projektowaniem wizualnym, znajomość implementacji generatywnych technologii może być niezwykle cenna. Szczególnie [ComfyUI](ComfyUI) i [htmlcsstoimage](https://htmlcsstoimage.com) zasługują na uwagę, umożliwiając wprowadzenie zaawansowanych procesów w działaniach marketingowych i produktowych.

Praktyczne zastosowanie modeli generatywnych w programowaniu jest widoczne w projektach takich jak te stworzone przez Pietera Levelsa, pokazując, jak AI może wspierać różnorodne aspekty tworzenia i zarządzania treścią wizualną.

*Życzymy powodzenia w odkrywaniu możliwości generatywnej grafiki!*