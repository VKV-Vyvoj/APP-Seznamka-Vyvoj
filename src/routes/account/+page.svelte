<!-- src/routes/Account.svelte -->
<script lang="ts">
    import { app, auth, db, storage } from "../../firebase/Firebase";
    import { onAuthStateChanged } from "firebase/auth";
    import { get, ref, set } from "firebase/database";
    import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
    import Swal from "sweetalert2";
    import type { User } from "firebase/auth";
  
    let user: User | null = null;
    let displayName: string = "";
    let age: string = "";
    let country: string = "";
    let isSurveyCompleted: boolean = false;
    let isFirstLogin: boolean = false;
  
    let city: string = "";
    let bio: string = "";
    let interests: string[] = [];
    let orientation: string = "";
    let lookingFor: string[] = [];
  
    let step: number = 1; // Krok 1: Vyplňování informací, Krok 2: Nahrávání fotek, Krok 3: Zobrazení účtu
  
    let profileImage: File | null = null;
    let additionalImages: File[] = [];
  
    const availableInterests = [
      "Sport",
      "Cestování",
      "Knižní četba",
      "Umění",
      "Hudba",
      "Film",
      "Jídlo",
      "Venčení",
      "Technologie",
      "Zahrádka",
    ];
  
    const availableOrientations = ["Heterosexuální", "Homosexuální", "Bisexuální", "Asexuální", "Jiné"];
  
    const availableLookingFor = ["Vztah", "Randění", "Přátelství", "Chat", "Pokec"];
  
    const loadUserData = () => {
      if (!user) return;
      const userRef = ref(db, `users/${user.uid}`);
      get(userRef)
        .then((snapshot) => {
          const userData = snapshot.val();
          if (userData) {
            displayName = userData.displayName;
            age = userData.age || "";
            country = userData.country || "";
            isSurveyCompleted = userData.isSurveyCompleted || false;
            city = userData.city || "";
            bio = userData.bio || "";
            interests = userData.interests || [];
            orientation = userData.orientation || "";
            lookingFor = userData.lookingFor || [];
          }
        })
        .catch((error) => {
          console.error("Chyba při načítání uživatelských dat:", error);
        });
    };
  
    onAuthStateChanged(auth, (currentUser) => {
      user = currentUser;
      loadUserData();
      if (user && !isSurveyCompleted) {
        isFirstLogin = true;
      }
    });
  
    const saveData = async () => {
      if (step === 1) {
        if (!displayName || !age || !country || !city || !bio || interests.length === 0 || !orientation || lookingFor.length === 0) {
          Swal.fire({
            icon: "error",
            title: "Všechna pole jsou povinná",
            text: "Vyplňte všechna pole před pokračováním.",
          });
          return;
        }
        step = 2;
      } else if (step === 2) {
        if (!profileImage || additionalImages.length < 2) {
          Swal.fire({
            icon: "error",
            title: "Nahrání fotek",
            text: "Nahrát profilovou fotku a alespoň další dvě fotky je povinné.",
          });
          return;
        }
        // Nahrání fotek a uložení URL do databáze
        const profileImageUrl = await uploadProfileImage();
        const additionalImageUrls = await uploadAdditionalImages();
  
        const userRef = ref(db, `users/${user!.uid}`);
        set(userRef, {
          profileImageUrl,
          additionalImageUrls,
        }).then(() => {
          step = 3;
          Swal.fire({
            icon: "success",
            title: "Dotazník byl úspěšně uložen!",
            showConfirmButton: false,
            timer: 1500,
          });
        });
      }
    };
  
    const uploadProfileImage = async () => {
      if (!profileImage || !user) return "";
      const storageRefPath = `profile_images/${user.uid}/${profileImage.name}`;
      const storageRefObj = storageRef(storage, storageRefPath);
  
      try {
        await uploadBytes(storageRefObj, profileImage);
        const downloadURL = await getDownloadURL(storageRefObj);
        return downloadURL;
      } catch (error) {
        console.error("Chyba při nahrávání profilové fotky:", error);
        return "";
      }
    };
  
    const uploadAdditionalImages = async () => {
      if (additionalImages.length === 0 || !user) return [];
  
      const imageUrls = [];
      for (const image of additionalImages) {
        const storageRefPath = `additional_images/${user.uid}/${image.name}`;
        const storageRefObj = storageRef(storage, storageRefPath);
  
        try {
          await uploadBytes(storageRefObj, image);
          const downloadURL = await getDownloadURL(storageRefObj);
          imageUrls.push(downloadURL);
        } catch (error) {
          console.error("Chyba při nahrávání dalších fotek:", error);
        }
      }
  
      return imageUrls;
    };
  
    const logout = () => {
      // Odhlášení uživatele zde (signOut)
    };
  </script>
  
  <div class="h-screen w-full">
    <div class="bg-gray-800 h-screen mx-auto max-w-md">
      {#if isFirstLogin && step === 1}
      <!-- Karta pro vyplnění dotazníku: Krok 1 -->
      <div class="p-6 md:p-12">
        <p class="text-center text-3xl md:text-5xl pt-6 pb-3 text-yellow-500 font-bold">
          Vítejte, {displayName}!
        </p>
        <p class="text-center text-lg md:text-xl py-2 text-gray-400 font-semibold">Vyplňte dotazník</p>
        <div class="p-3 md:p-6">
          <input placeholder="Vaše jméno" bind:value={displayName} class="bg-transparent text-yellow-500 w-full focus:outline-none focus:ring mb-3" type="text" required />
          <input placeholder="Váš věk" bind:value={age} class="bg-transparent text-yellow-500 w-full focus:outline-none focus:ring mb-3" type="number" required />
          <input placeholder="Vaše země" bind:value={country} class="bg-transparent text-yellow-500 w-full focus:outline-none focus:ring mb-3" type="text" required />
          <input placeholder="Město" bind:value={city} class="bg-transparent text-yellow-500 w-full focus:outline-none focus:ring mb-3" type="text" required />
          <textarea placeholder="Bio" bind:value={bio} class="bg-transparent text-yellow-500 w-full focus:outline-none focus:ring mb-3" required></textarea>
          <label class="text-yellow-500 mt-3 mb-2">Zájmy:</label>
          <div class="flex flex-wrap gap-1">
            {#each availableInterests as interest}
            <div class="bg-gray-700 p-1 rounded-lg flex items-center gap-2">
              <input type="checkbox" id={interest} bind:group={interests} value={interest} class="form-checkbox h-4 w-4 text-yellow-500" required />
              <label for={interest} class="text-white text-xs">{interest}</label>
            </div>
            {/each}
          </div>
          <label class="text-yellow-500 mt-3 mb-2">Orientace:</label>
          <select bind:value={orientation} class="bg-transparent text-yellow-500 w-full focus:outline-none focus:ring mb-3" required>
            {#each availableOrientations as option}
            <option value={option}>{option}</option>
            {/each}
          </select>
          <label class="text-yellow-500 mt-3 mb-2">Hledám:</label>
          <div class="flex flex-wrap gap-1">
            {#each availableLookingFor as item}
            <div class="bg-gray-700 p-1 rounded-lg flex items-center gap-2">
              <input type="checkbox" id={item} bind:group={lookingFor} value={item} class="form-checkbox h-4 w-4 text-yellow-500" required />
              <label for={item} class="text-white text-xs">{item}</label>
            </div>
            {/each}
          </div>
          <label class="text-yellow-500 mt-3 mb-2">Profilová fotka (povinná):</label>
          <input type="file" accept="image/*" on:change={(e) => (profileImage = e.target.files[0])} required />
          <label class="text-yellow-500 mt-3 mb-2">Další fotografie (minimálně 2, povinné):</label>
          <input type="file" accept="image/*" multiple on:change={(e) => (additionalImages = [...e.target.files])} required />
          <button on:click={saveData} class="bg-yellow-500 p-3 rounded-3xl w-full h-full hover:bg-yellow-600 mt-4">Pokračovat</button>
        </div>
      </div>
      {:else if step === 2}
      <!-- Krok 2: Nahrávání fotek -->
      <div class="p-6 md:p-12">
        <p class="text-center text-3xl md:text-5xl pt-6 pb-3 text-yellow-500 font-bold">
          Nahrávání fotek
        </p>
        <p class="text-center text-lg md:text-xl py-2 text-gray-400 font-semibold">Nahrát profilovou fotku a alespoň další dvě fotky.</p>
        <div class="p-3 md:p-6">
          <label class="text-yellow-500 mt-3 mb-2">Profilová fotka (povinná):</label>
          <input type="file" accept="image/*" on:change={(e) => (profileImage = e.target.files[0])} required />
          <label class="text-yellow-500 mt-3 mb-2">Další fotografie (minimálně 2, povinné):</label>
          <input type="file" accept="image/*" multiple on:change={(e) => (additionalImages = [...e.target.files])} required />
          <button on:click={saveData} class="bg-yellow-500 p-3 rounded-3xl w-full h-full hover:bg-yellow-600 mt-4">Uložit dotazník</button>
        </div>
      </div>
      {:else}
      <!-- Krok 3: Zobrazení účtu -->
      <div class="p-6 md:p-12">
        <p class="text-center text-3xl md:text-5xl pt-6 pb-3 text-yellow-500 font-bold">
          Vítejte, {displayName}!
        </p>
        <p class="text-center text-lg md:text-xl py-2 text-gray-400 font-semibold">Tady můžete zobrazit jiný obsah</p>
        <button on:click={logout} class="bg-yellow-500 p-3 rounded-3xl w-full h-full hover:bg-yellow-600 mt-4">Odhlásit se</button>
      </div>
      {/if}
    </div>
  </div>
  