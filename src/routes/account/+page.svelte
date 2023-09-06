<script lang="ts">
    import { auth, db, storage } from "../../firebase/Firebase";
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
  
    onAuthStateChanged(auth, async (currentUser) => {
      user = currentUser;
  
      if (user) {
        // Zkontrolujeme, zda již dotazník byl vyplněn
        if (!isSurveyCompleted) {
          isFirstLogin = true;
        } else {
          // Pokud byl dotazník již vyplněn, můžeme načíst uživatelská data
          loadUserData();
        }
      }
    });
  
    let step = 1; // Krok 1 pro vyplňování informací, krok 2 pro nahrávání fotek
  
    const uploadProfileImage = async () => {
      if (user && profileImage) {
        try {
          const storageRef = ref(storage, `users/${user.uid}/profile-image.jpg`);
          await uploadBytes(storageRef, profileImage);
          const downloadURL = await getDownloadURL(storageRef);
          return downloadURL;
        } catch (error) {
          console.error("Chyba při nahrávání profilové fotky:", error);
          return null;
        }
      }
      return null;
    };
  
    const uploadAdditionalImages = async () => {
      if (user && additionalImages.length > 0) {
        try {
          const imagePromises = additionalImages.map(async (image, index) => {
            const storageRef = ref(storage, `users/${user.uid}/image${index + 1}.jpg`);
            await uploadBytes(storageRef, image);
            return getDownloadURL(storageRef);
          });
          const downloadURLs = await Promise.all(imagePromises);
          return downloadURLs;
        } catch (error) {
          console.error("Chyba při nahrávání dalších fotek:", error);
          return [];
        }
      }
      return [];
    };
  
    const saveData = async () => {
      if (step === 1) {
        // Pokud jsme na kroku 1, uložíme informace
        const userRef = ref(db, `users/${user!.uid}`);
        set(userRef, {
          displayName,
          age,
          country,
          city,
          bio,
          interests,
          orientation,
          lookingFor,
          isSurveyCompleted: true,
        }).then(() => {
          step = 2; // Přechod na krok 2 pro nahrávání fotek
        });
      } else if (step === 2) {
        // Pokud jsme na kroku 2, uložíme fotky a přejdeme do účtu
        const profileImageUrl = await uploadProfileImage();
        const additionalImageUrls = await uploadAdditionalImages();
  
        const userRef = ref(db, `users/${user!.uid}`);
        set(userRef, {
          profileImageUrl,
          additionalImageUrls,
        }).then(() => {
          step = 3; // Přechod do účtu
          Swal.fire({
            icon: "success",
            title: "Dotazník byl úspěšně uložen!",
            showConfirmButton: false,
            timer: 1500,
          });
        });
      }
    };
  
    const logout = () => {
      // Odhlášení uživatele zde
    };
  </script>
  
  <div class="h-screen w-full">
    <div class="bg-gray-800 h-screen mx-auto max-w-md">
      {#if isFirstLogin}
      <!-- Karta pro vyplnění informací -->
      <div class="p-6 md:p-12">
        <p class="text-center text-3xl md:text-5xl pt-6 pb-3 text-yellow-500 font-bold">
          Vítejte, {displayName}!
        </p>
        <p class="text-center text-lg md:text-xl py-2 text-gray-400 font-semibold">Vyplňte dotazník</p>
        <div class="p-3 md:p-6">
          <input placeholder="Vaše jméno" bind:value={displayName} class="bg-transparent text-yellow-500 w-full focus:outline-none focus:ring mb-3" type="text" />
          <input placeholder="Váš věk" bind:value={age} class="bg-transparent text-yellow-500 w-full focus:outline-none focus:ring mb-3" type="number" />
          <input placeholder="Vaše země" bind:value={country} class="bg-transparent text-yellow-500 w-full focus:outline-none focus:ring mb-3" type="text" />
          <input placeholder="Město" bind:value={city} class="bg-transparent text-yellow-500 w-full focus:outline-none focus:ring mb-3" type="text" />
          <textarea placeholder="Bio" bind:value={bio} class="bg-transparent text-yellow-500 w-full focus:outline-none focus:ring mb-3"></textarea>
          <label class="text-yellow-500 mt-3 mb-2">Zájmy:</label>
          <div class="flex flex-wrap gap-1">
            {#each availableInterests as interest}
            <div class="bg-gray-700 p-1 rounded-lg flex items-center gap-2">
              <input type="checkbox" id={interest} bind:group={interests} value={interest} class="form-checkbox h-4 w-4 text-yellow-500" />
              <label for={interest} class="text-white text-xs">{interest}</label>
            </div>
            {/each}
          </div>
          <label class="text-yellow-500 mt-3 mb-2">Orientace:</label>
          <select bind:value={orientation} class="bg-transparent text-yellow-500 w-full focus:outline-none focus:ring mb-3">
            {#each availableOrientations as option}
            <option value={option}>{option}</option>
            {/each}
          </select>
          <label class="text-yellow-500 mt-3 mb-2">Hledám:</label>
          <div class="flex flex-wrap gap-1">
            {#each availableLookingFor as item}
            <div class="bg-gray-700 p-1 rounded-lg flex items-center gap-2">
              <input type="checkbox" id={item} bind:group={lookingFor} value={item} class="form-checkbox h-4 w-4 text-yellow-500" />
              <label for={item} class="text-white text-xs">{item}</label>
            </div>
            {/each}
          </div>
          <button on:click={saveData} class="bg-yellow-500 p-3 rounded-3xl w-full h-full hover:bg-yellow-600 mt-4">Pokračovat</button>
        </div>
      </div>
      {/if}
      {#if step === 2}
      <!-- Karta pro nahrávání fotek -->
      <div class="p-6 md:p-12">
        <p class="text-center text-3xl md:text-5xl pt-6 pb-3 text-yellow-500 font-bold">
          Nahrát fotky
        </p>
        <div class="p-3 md:p-6">
          <label class="text-yellow-500 mt-3 mb-2">Profilová fotka:</label>
          <input type="file" accept="image/*" on:change={(e) => (profileImage = e.target.files[0])} />
          <label class="text-yellow-500 mt-3 mb-2">Další fotografie (max. 10):</label>
          <input type="file" accept="image/*" multiple on:change={(e) => (additionalImages = [...e.target.files])} />
          <button on:click={saveData} class="bg-yellow-500 p-3 rounded-3xl w-full h-full hover:bg-yellow-600 mt-4">Uložit dotazník</button>
        </div>
      </div>
      {/if}
      {#if step === 3}
      <!-- Přechod do účtu -->
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
  