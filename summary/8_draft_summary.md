# AI_devs 3, Lekcja 1, Moduł 1 — Interakcja z dużym modelem językowym

![Cover](https://cloud.overment.com/S02E03-1731372201.png)

W dobie dynamicznie rozwijającego się generatywnego AI, które radzi sobie doskonale z przetwarzaniem tekstu, audio i obrazów, pojawia się coraz więcej opcji manipulacji i tworzenia nowych grafik oraz zdjęć. Choć tradycyjnie projektowanie wizualne nie było bezpośrednio związane z programowaniem, generatywne AI zmienia ten krajobraz, włączając programistów w obszary zarezerwowane wcześniej dla projektantów i ilustratorów.

## Generatywne narzędzia AI

Kilka narzędzi, takich jak [Midjourney](tools/Midjourney.md) czy [Stable Diffusion](glossary/Stable%20Diffusion.md), zazwyczaj wybieranych przez osoby zajmujące się projektowaniem graficznym, teraz znajduje zastosowanie także w świecie programistów. Dzięki ich integracji, programiści mogą wykorzystywać te narzędzia do wzbogacania funkcjonalności już rozwijanych aplikacji.

Narzędziem, które dobrze ilustruje potencjał generatywnego AI, jest [picthing](https://pic.ping.gg/), stworzonym przez Theo z `t3.gg`. Umożliwia ono wysokiej jakości usuwanie tła ze zdjęć, co jest lepsze niż wiele istniejących metod.

![](https://cloud.overment.com/2024-09-26/aidevs3_picthing-a5ce0e6a-b.png)

### Projekty Pietera Levelsa

W kontekście projektów generatywnego AI, warto przyjrzeć się projektom [Pietera Levelsa](https://x.com/levelsio): [PhotoAI](https://photoai.com/) oraz [InteriorAI](https://interiorai.com). Projekty te przedstawiają konkretne zastosowania AI w rozwiązywaniu problemów, co potwierdzają również statystyki udostępniane przez ich twórcę.

![](https://cloud.overment.com/2024-09-26/aidevs3_levelsio-55df5a6e-5.png)

## Obecne możliwości generowania obrazu

Rozwój generatywnych grafik na przestrzeni ostatnich dwóch lat jest imponujący. Artykuł [Comparing AI-generated images two years apart — 2022 vs. 2024](https://medium.com/@junehao/comparing-ai-generated-images-two-years-apart-2022-vs-2024-6c3c4670b905) pokazuje, jak znacząco poprawiła się jakość generowanych obrazów od 2022 roku. Niemniej jednak, pewne ograniczenia w generowaniu określonych elementów, takich jak tekst czy detale postaci, pozostają wyzwaniem dla obecnych modeli AI, jak [Flux](glossary/Flux.md).

![](https://cloud.overment.com/2024-09-26/aidevs3_midjourney-79dd9b18-9.png)

Mimo tych ograniczeń, jakość generowanych obrazów jest obecnie bardzo wysoka. Modele mogą być używane nie tylko do kreowania nowych obrazów, ale również do edycji istniejących grafik. Przykład narzędzia [ComfyUI](ComfyUI) pokazuje, jak można przekształcać twarz na zdjęciu wygenerowanym poprzez [Midjourney](tools/Midjourney.md).

![](https://cloud.overment.com/2024-09-26/aidevs3_swap-92e327ca-8.png)

## Wdrożenie modeli poprzez API

Dla programistów kluczową zaletą jest dostępność modeli poprzez API lub możliwość ich samoobsługowego hostowania. Usługi takie jak [Replicate](tools/Replicate.md) i [Leonardo.ai](https://leonardo.ai/) umożliwiają deweloperom integrację zaawansowanych modeli graficznych w swoich projektach. Platforma [RunPod](https://blog.runpod.io/how-to-get-stable-diffusion-set-up-with-comfyui-on-runpod/) to przykład rozwiązania dla tych, którzy potrzebują dostępu do GPU do własnych wdrożeń.

Podczas manipulacji obrazami, korzystanie z szablonów jest nieocenione, szczególnie w celach marketingowych, takich jak tworzenie różnych form reklamowych, czy grafik na potrzeby blogów. W czasie oszczędza to wiele pracy, pozwalając na automatyczne modyfikacje zdjęć i tekstów.

![](https://cloud.overment.com/2024-09-26/aidevs3_eduweb-b678b9a8-5.png)

## Znaczenie promptów i metastrategii

Podobnie jak w przypadku modeli językowych (LLM), generowanie grafik opiera się na odpowiednim zdefiniowaniu promptów. W praktyce oznacza to używanie słów kluczowych oraz flag sterujących ustawieniami. Obrazy referencyjne mogą pomóc w zachowaniu spójności stylu, co jest ważne dla projektów zgodnych z marką. Przykład prompty z [Midjourney](tools/Midjourney.md) pokazuje, jak użycie metapromptów może prowadzić do uzyskania spójnych stylów w nowych grafikach.

![](https://cloud.overment.com/2024-09-27/aidevs3_smoke-2656d5ad-6.png)

## Narzędzia oparte na szablonach HTML

[ComfyUI](ComfyUI) i narzędzia takie jak [htmlcsstoimage](https://htmlcsstoimage.com) umożliwiają generowanie obrazów na podstawie szablonów HTML, modyfikowanych dynamicznie na potrzeby API. Daje to ogromne możliwości w zakresie dostosowywania grafiki w zależności od potrzeb użytkownika, zachowując jednocześnie pełną kontrolę nad stylem i formatem.

![](https://cloud.overment.com/2024-09-27/aidevs3_htmlcsstoimage-c6f590af-a.png)

## Podsumowanie

Narzędzia generatywnej grafiki AI otwierają nowe perspektywy dla automatyzacji i tworzenia wyspecjalizowanych narzędzi do przekształcania obrazów. Nawet jeśli praca nad projektami wizualnymi nie jest naszym głównym zajęciem, wiedza na temat implementacji generatywnych technologii może okazać się niezwykle wartościowa. Szczególnie [ComfyUI](ComfyUI) i [htmlcsstoimage](https://htmlcsstoimage.com) zasługują na uwagę, pozwalając na wprowadzanie zaawansowanych procesów w działaniach marketingowych i produktowych.

Wiedza na temat tworzenia programistycznych rozwiązań z wykorzystaniem modeli generatywnych grafiki daje praktyczne możliwości i jest widoczna w licznych projektach, takich jak te autorstwa Pietera Levelsa.

*Powodzenia w eksplorowaniu możliwości generatywnej grafiki!*