<!-- src/routes/Register.svelte -->
<script>
    import { app, auth, db } from "../../firebase/Firebase"; // Upravte cestu podle svého projektu
    import { createUserWithEmailAndPassword } from "firebase/auth";
  import { ref, set } from "firebase/database";

  import Swal from "sweetalert2"; // Import SweetAlert2

  let email = "";
  let password = "";
  let displayName = "";

  const registerUser = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Uložení uživatelského profilu do Realtime databáze
      const uid = userCredential.user.uid;

      // Nastavení uživatelského profilu, včetně jména
      await set(ref(db, `users/${uid}`), {
        email,
        displayName,
      });

      // Uživatel byl úspěšně zaregistrován, zobrazení SweetAlert notifikace
      Swal.fire({
        icon: "success",
        title: "Registrace proběhla úspěšně!",
        text: "Budete přesměrováni na účet za 5 sekundy.",
        showConfirmButton: false,
        timer: 5000,
      }).then(() => {
        // Po uplynutí 5 sekund přesměrování na stránku /account pomocí standardního HTML přesměrování
        window.location.href = "/account";
      });
    } catch (error) {
      console.error("Chyba při registraci:", error);
    }
  };
</script>

  
  <div class="h-screen w-full">
    <div class="bg-gray-800 h-screen mx-auto max-w-md">
      <div class="p-12">
        <p class="text-center text-5xl pt-10 text-yellow-500 font-bold">
          Vítejte
        </p>
        <p class="text-center text-xl py-3 text-gray-400 font-semibold">Pro registrace vyplňte údaje</p>
      </div>
      <div class="mx-12 p-3 rounded-xl shadow-sm bg-gray-900">
        <div class="p-3 mx-6 border-b border-gray-500">
          <input placeholder="Tvoje jméno" bind:value={displayName} class="bg-transparent text-yellow-500 w-full focus:outline-none focus:ring" type="text" />
        </div>
        <div class="p-3 mx-6 border-b border-gray-500">
          <input placeholder="Tvůj email" bind:value={email} class="bg-transparent text-yellow-500 w-full focus:outline-none focus:ring" type="email" />
        </div>
  
        <div class="p-3 mx-6 flex border-b border-gray-500">
          <input placeholder="Tvoje heslo" bind:value={password} class="bg-transparent text-yellow-500 focus:outline-none focus:ring w-full" type="password" />
        </div>
      </div>
      <div class="mx-12 p-3 justify-between flex">
        <div class="flex">
          <div class="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">           
          </div>
        </div>
      </div>
      <div class="w-full p-12">
        <button on:click={registerUser} class="bg-yellow-500 p-3 rounded-3xl w-full h-full hover:bg-yellow-600">Registrovat se</button>
        <p class="mx-auto text-center mt-3 text-gray-400">Už máš účet?  <a href="/login" class="text-md font-semibold">Přihlaš se</a> </p>
      </div>
    </div>
  </div>
  